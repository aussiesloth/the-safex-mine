use std::{
    collections::VecDeque,
    io,
    mem::size_of,
    os::windows::io::{
        AsRawHandle,
        FromRawHandle,
        OwnedHandle,
    },
    path::PathBuf,
    process::{
        self,
        Stdio,
    },
    sync::{
        Arc,
        Mutex,
    },
    thread,
    time::Duration,
};

use tokio::{
    io::{
        AsyncBufReadExt,
        AsyncRead,
        AsyncWriteExt,
        BufReader,
    },
    net::windows::named_pipe::{
        ClientOptions,
        NamedPipeClient,
    },
    process::{
        Child,
        Command as TokioCommand,
    },
    time::{
        sleep,
        timeout,
    },
};

use windows::Win32::{
    Foundation::{
        CloseHandle,
        ERROR_PIPE_BUSY,
        HANDLE,
    },
    Security::{
        GetTokenInformation,
        TokenElevation,
        TOKEN_ELEVATION,
        TOKEN_QUERY,
    },
   System::{
    Console::{
        GenerateConsoleCtrlEvent,
        SetConsoleCtrlHandler,
        CTRL_C_EVENT,
    },
    JobObjects::{
        AssignProcessToJobObject,
        CreateJobObjectW,
        JobObjectExtendedLimitInformation,
        SetInformationJobObject,
        JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
        JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
    },
    Threading::{
        GetCurrentProcess,
        OpenProcess,
        OpenProcessToken,
        PROCESS_SET_QUOTA,
        PROCESS_TERMINATE,
    },
},
};


fn is_process_elevated()
    -> windows::core::Result<bool>
{
    unsafe {
        let mut token =
            HANDLE::default();

        OpenProcessToken(
            GetCurrentProcess(),
            TOKEN_QUERY,
            &mut token,
        )?;

        let mut elevation =
            TOKEN_ELEVATION::default();

        let mut returned_length =
            0u32;

        let result =
            GetTokenInformation(
                token,
                TokenElevation,
                Some(
                    (
                        &mut elevation
                            as *mut TOKEN_ELEVATION
                    )
                    .cast(),
                ),
                size_of::<TOKEN_ELEVATION>()
                    as u32,
                &mut returned_length,
            );

        let _ =
            CloseHandle(token);

        result?;

        Ok(
            elevation.TokenIsElevated
                != 0,
        )
    }
}


fn get_argument(
    name: &str,
) -> Option<String> {

    let args:
        Vec<String> =
        std::env::args()
            .collect();

    args.windows(2)
        .find(|pair| {
            pair[0] == name
        })
        .map(|pair| {
            pair[1].clone()
        })
}


fn has_argument(
    name: &str,
) -> bool {

    std::env::args()
        .any(|arg| {
            arg == name
        })
}


async fn connect_to_pipe(
    pipe_name: &str,
) -> io::Result<NamedPipeClient> {

    for _ in 0..100 {

        match ClientOptions::new()
            .open(pipe_name)
        {
            Ok(client) => {
                return Ok(client);
            }

            Err(error)
                if
                    error.raw_os_error()
                        == Some(
                            ERROR_PIPE_BUSY.0
                                as i32
                        )
                    ||
                    error.kind()
                        == io::ErrorKind::NotFound
                =>
            {
                sleep(
                    Duration::from_millis(
                        50,
                    ),
                )
                .await;
            }

            Err(error) => {
                return Err(error);
            }
        }
    }

    Err(
        io::Error::new(
            io::ErrorKind::TimedOut,
            "Timed out connecting to Safex Mine pipe.",
        ),
    )
}


async fn run_pipe_probe(
    pipe_name: String,
    token: String,
) -> Result<(), String> {

    let client =
        connect_to_pipe(
            &pipe_name,
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to connect to Safex Mine pipe: {error}"
            )
        })?;

    let (
        reader,
        mut writer,
    ) =
        tokio::io::split(
            client,
        );

    let mut reader =
        BufReader::new(
            reader,
        );

    writer
        .write_all(
            format!(
                "HELLO {token}\n"
            )
            .as_bytes(),
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to send helper handshake: {error}"
            )
        })?;

    writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush helper handshake: {error}"
            )
        })?;

    let mut command =
        String::new();

    reader
        .read_line(
            &mut command,
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to read pipe command: {error}"
            )
        })?;

    if command.trim()
        != "PING"
    {
        return Err(
            format!(
                "Unexpected command from Safex Mine: {}",
                command.trim()
            ),
        );
    }

    writer
        .write_all(
            b"PONG ELEVATED\n",
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to send helper response: {error}"
            )
        })?;

    writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush helper response: {error}"
            )
        })?;

    Ok(())
}

#[derive(Default)]
struct MinerTelemetry {
    msr_ok: bool,
    msr_failed: bool,
    daemon_connected: bool,
    daemon_was_connected: bool,
    hashrate_hs: Option<f64>,
    worker_threads: Option<u32>,
    accepted_count: u64,
    rejected_count: u64,
    recent_lines: VecDeque<String>,
}

struct KillOnCloseJob {
    handle: OwnedHandle,
}


impl KillOnCloseJob {

    fn as_handle(
        &self,
    ) -> HANDLE {

        HANDLE(
            self.handle
                .as_raw_handle(),
        )
    }
}

fn create_kill_on_close_job()
    -> Result<KillOnCloseJob, String>
{
    unsafe {

        let handle =
            CreateJobObjectW(
                None,
                None,
            )
            .map_err(|error| {
                format!(
                    "Unable to create XMRig Job Object: {error}"
                )
            })?;


        let handle =
            OwnedHandle::from_raw_handle(
                handle.0,
            );


        let mut information =
            JOBOBJECT_EXTENDED_LIMIT_INFORMATION::default();


        information
            .BasicLimitInformation
            .LimitFlags =
            JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;


        SetInformationJobObject(
            HANDLE(
                handle.as_raw_handle(),
            ),
            JobObjectExtendedLimitInformation,
            (
                &information
                    as *const JOBOBJECT_EXTENDED_LIMIT_INFORMATION
            )
            .cast(),
            size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>()
                as u32,
        )
        .map_err(|error| {
            format!(
                "Unable to configure XMRig Job Object: {error}"
            )
        })?;


        Ok(
            KillOnCloseJob {
                handle,
            },
        )
    }
}


fn assign_process_to_job(
    job: &KillOnCloseJob,
    process_id: u32,
) -> Result<(), String> {

    unsafe {

        let process_handle =
            OpenProcess(
                PROCESS_SET_QUOTA
                    | PROCESS_TERMINATE,
                false,
                process_id,
            )
            .map_err(|error| {
                format!(
                    "Unable to open XMRig for Job Object assignment: {error}"
                )
            })?;


        let process_handle =
            OwnedHandle::from_raw_handle(
                process_handle.0,
            );


        AssignProcessToJobObject(
            job.as_handle(),
            HANDLE(
                process_handle
                    .as_raw_handle(),
            ),
        )
        .map_err(|error| {
            format!(
                "Unable to assign XMRig to Job Object: {error}"
            )
        })?;


        Ok(())
    }
}

struct MinerProcess {
    child: Child,
    telemetry: Arc<Mutex<MinerTelemetry>>,
    _job: KillOnCloseJob,
}


fn mining_backend_dir()
    -> Result<PathBuf, String>
{
    let executable =
        std::env::current_exe()
            .map_err(|error| {
                format!(
                    "Unable to locate Safex Mine helper executable: {error}"
                )
            })?;

    let executable_dir =
        executable
            .parent()
            .ok_or_else(|| {
                "Unable to locate Safex Mine helper directory."
                    .to_string()
            })?
            .to_path_buf();

    /*
       Packaged releases place the helper,
       XMRig and WinRing driver together in
       the Tauri runtime resource directory.

       If either packaged backend file is
       present, treat this as the runtime
       directory so a missing companion file
       is reported from the correct location.
    */
    if executable_dir
        .join(
            "safex-xmrig-x86_64-pc-windows-msvc.exe",
        )
        .exists()
        ||
        executable_dir
            .join(
                "WinRing0x64.sys",
            )
            .exists()
    {
        return Ok(
            executable_dir
        );
    }

    /*
       Development builds keep the helper in
       helper/target/release while the mining
       backend lives in src-tauri/binaries.
    */
    let helper_source_dir =
        PathBuf::from(
            env!("CARGO_MANIFEST_DIR"),
        );

    if let Some(src_tauri_dir) =
        helper_source_dir.parent()
    {
        let development_backend =
            src_tauri_dir
                .join("binaries");

        if development_backend.exists() {
            return Ok(
                development_backend
            );
        }
    }

    /*
       On an installed machine where both
       packaged backend files are unexpectedly
       missing, return the helper directory so
       the later file checks report the real
       installed runtime path.
    */
    Ok(
        executable_dir
    )
}

fn parse_short_hashrate(
    line: &str,
) -> Option<f64> {

    let parts:
        Vec<&str> =
        line
            .split_whitespace()
            .collect();


    let marker =
        parts
            .iter()
            .position(|part| {
                *part
                    == "10s/60s/15m"
            })?;


    let value =
        parts
            .get(
                marker + 1,
            )?;


    if *value == "n/a" {
        return None;
    }


    let value:
        f64 =
        value
            .parse()
            .ok()?;


    /*
       XMRig prints the unit after the three
       interval values:

       712.4 n/a n/a H/s
       1.23  1.20 n/a MH/s
    */
    let unit =
        parts
            .get(
                marker + 4,
            )
            .copied()
            .unwrap_or(
                "H/s",
            );


    match unit {
        "H/s" =>
            Some(
                value,
            ),

        "kH/s" =>
            Some(
                value
                    * 1_000.0,
            ),

        "MH/s" =>
            Some(
                value
                    * 1_000_000.0,
            ),

        _ =>
            None,
    }
}

fn parse_worker_threads(
    line: &str,
) -> Option<u32> {

    if !line.contains(
        "use profile"
    ) {
        return None;
    }


    let open =
        line.find(
            '(',
        )?;


    let remainder =
        &line[
            open + 1..
        ];


    let end =
        remainder.find(
            " thread",
        )?;


    remainder[
        ..end
    ]
    .trim()
    .parse()
    .ok()
}

fn record_miner_line(
    telemetry: &Arc<Mutex<MinerTelemetry>>,
    line: String,
) {

    let Ok(
        mut telemetry
    ) =
        telemetry.lock()
    else {
        return;
    };


    if line.contains(
        "register values for"
    )
        && line.contains(
            "preset have been set successfully"
        )
    {
        telemetry.msr_ok =
            true;
    }


    if line.contains(
        "FAILED TO APPLY MSR MOD"
    ) {
        telemetry.msr_failed =
            true;
    }

    if line.contains(
        "new job from"
    ) {
        telemetry.daemon_connected =
            true;

        telemetry.daemon_was_connected =
            true;
    }

    if line.contains(
        "no active pools, stop mining"
    ) {
        telemetry.daemon_connected =
            false;

        /*
        Do not leave the last good hashrate
        visible while XMRig is paused waiting
        for the daemon to return.
        */
        telemetry.hashrate_hs =
            Some(
                0.0,
            );
    }

    if line.contains(
        " accepted ("
    ) {
        telemetry.accepted_count +=
            1;
    }


    if line.contains(
        " rejected ("
    ) {
        telemetry.rejected_count +=
            1;
    }
    if let Some(
    threads
) =
    parse_worker_threads(
        &line,
    )
{
    telemetry.worker_threads =
        Some(
            threads,
        );
}

    if line.contains(
        "speed 10s/60s/15m"
    ) {

        if let Some(hashrate) =
            parse_short_hashrate(
                &line,
            )
        {
            telemetry.hashrate_hs =
                Some(
                    hashrate,
                );
        }
    }    


    if telemetry.recent_lines.len()
        >= 40
    {
        telemetry
            .recent_lines
            .pop_front();
    }


    telemetry
        .recent_lines
        .push_back(
            line,
        );
}


fn spawn_miner_output_reader<R>(
    stream: R,
    telemetry: Arc<Mutex<MinerTelemetry>>,
)
where
    R:
        AsyncRead
        + Unpin
        + Send
        + 'static,
{

    tokio::spawn(
        async move {

            let mut lines =
                BufReader::new(
                    stream,
                )
                .lines();


            while let Ok(
                Some(line)
            ) =
                lines.next_line().await
            {
                record_miner_line(
                    &telemetry,
                    line,
                );
            }
        },
    );
}


fn telemetry_summary(
    telemetry: &Arc<Mutex<MinerTelemetry>>,
) -> String {

    let Ok(
        telemetry
    ) =
        telemetry.lock()
    else {

        return (
            "MSR=UNKNOWN | \
             DAEMON=UNKNOWN | \
             LAST=telemetry unavailable"
        )
        .to_string();
    };


    let msr =
        if telemetry.msr_failed {
            "Unavailable"
        }
        else if telemetry.msr_ok {
            "OK"
        }
        else {
            "PENDING"
        };

    let daemon =
        if telemetry.daemon_connected {
            "CONNECTED"
        }
        else if telemetry.daemon_was_connected {
            "DISCONNECTED"
        }
        else {
            "WAITING"
        };

    let hashrate =
    telemetry
        .hashrate_hs
        .map(|value| {
            format!(
                "{value:.1}"
            )
        })
        .unwrap_or_else(|| {
            "0.0"
                .to_string()
        });    

    let threads =
    telemetry
        .worker_threads
        .map(|value| {
            value.to_string()
        })
        .unwrap_or_else(|| {
            "PENDING"
                .to_string()
        });
        
    let last =
        telemetry
            .recent_lines
            .back()
            .cloned()
            .unwrap_or_else(|| {
                "no output yet"
                    .to_string()
            });


   let accepted =
    telemetry.accepted_count;

    let rejected =
        telemetry.rejected_count;


    format!(
        "MSR={msr} | \
        DAEMON={daemon} | \
        HASHRATE_HS={hashrate} | \
        THREADS={threads} | \
        ACCEPTED={accepted} | \
        REJECTED={rejected} | \
        LAST={last}"
    )
}


async fn stop_miner_process(
    miner: &mut MinerProcess,
) -> Result<String, String> {

    if let Some(status) =
        miner
            .child
            .try_wait()
            .map_err(|error| {
                format!(
                    "Unable to check XMRig state: {error}"
                )
            })?
    {
        return Ok(
            format!(
                "ALREADY_EXITED ({status})"
            )
        );
    }


    /*
       GenerateConsoleCtrlEvent broadcasts
       Ctrl+C to every process attached to
       this console.

       Protect the elevated helper from
       Ctrl+C for the ENTIRE time XMRig is
       shutting down. Restoring the handler
       immediately after generating the
       event creates a race where the helper
       can receive the Ctrl+C and exit too.
    */
    unsafe {

        SetConsoleCtrlHandler(
            None,
            true,
        )
        .map_err(|error| {
            format!(
                "Unable to protect helper from Ctrl+C: {error}"
            )
        })?;


        if let Err(error) =
            GenerateConsoleCtrlEvent(
                CTRL_C_EVENT,
                0,
            )
        {
            let _ =
                SetConsoleCtrlHandler(
                    None,
                    false,
                );

            return Err(
                format!(
                    "Unable to send Ctrl+C to XMRig: {error}"
                )
            );
        }
    }


    /*
       Do not re-enable Ctrl+C handling for
       the helper until XMRig has exited or
       the forced-stop fallback has finished.
    */
    let stop_result:
        Result<String, String> =

        match timeout(
            Duration::from_secs(
                8,
            ),
            miner.child.wait(),
        )
        .await
        {
            Ok(
                Ok(status)
            ) => {

                Ok(
                    format!(
                        "STOPPED_GRACEFULLY ({status})"
                    )
                )
            }


            Ok(
                Err(error)
            ) => {

                Err(
                    format!(
                        "Unable to wait for XMRig: {error}"
                    )
                )
            }


            Err(_) => {

                match miner
                    .child
                    .kill()
                    .await
                {
                    Ok(()) => {

                        let _ =
                            miner
                                .child
                                .wait()
                                .await;

                        Ok(
                            "STOPPED_FORCED"
                                .to_string()
                        )
                    }


                    Err(error) => {

                        Err(
                            format!(
                                "Unable to force-stop XMRig: {error}"
                            )
                        )
                    }
                }
            }
        };


    /*
       XMRig is now gone (or the stop attempt
       has completed), so restore the helper's
       normal Ctrl+C handling.
    */
    unsafe {

        SetConsoleCtrlHandler(
            None,
            false,
        )
        .map_err(|error| {
            format!(
                "Unable to restore helper Ctrl+C handling: {error}"
            )
        })?;
    }


    stop_result
}

async fn stop_miner(
    miner: &mut Option<MinerProcess>,
) -> Result<String, String> {

    let Some(
        mut process
    ) =
        miner.take()
    else {

        return Ok(
            "OK ALREADY_STOPPED"
                .to_string()
        );
    };


    let result =
        stop_miner_process(
            &mut process,
        )
        .await?;


    Ok(
        format!(
            "OK {result}"
        )
    )
}


async fn miner_status(
    miner: &mut Option<MinerProcess>,
) -> Result<String, String> {

    if miner.is_none() {

        return Ok(
            "STATUS IDLE"
                .to_string()
        );
    }


    let exit_status = {

        let process =
            miner
                .as_mut()
                .expect(
                    "miner checked above",
                );


        process
            .child
            .try_wait()
            .map_err(|error| {
                format!(
                    "Unable to check XMRig state: {error}"
                )
            })?
    };


    if let Some(status) =
        exit_status
    {

        let summary = {

            let process =
                miner
                    .as_ref()
                    .expect(
                        "miner still present",
                    );

            telemetry_summary(
                &process.telemetry,
            )
        };


        *miner =
            None;


        return Ok(
            format!(
                "STATUS EXITED ({status}) | {summary}"
            )
        );
    }


    let summary = {

        let process =
            miner
                .as_ref()
                .expect(
                    "miner still present",
                );

        telemetry_summary(
            &process.telemetry,
        )
    };


    Ok(
        format!(
            "STATUS ACTIVE | {summary}"
        )
    )
}


async fn start_miner(
    address: &str,
    daemon: &str,
    profile: &str,
    miner: &mut Option<MinerProcess>,
) -> Result<String, String> {

    /*
       If a previous child is still alive,
       don't launch a second miner.
    */
    let existing_running = {

        if let Some(
            process
        ) =
            miner.as_mut()
        {
            match process
                .child
                .try_wait()
            {
                Ok(None) => true,

                Ok(Some(_)) => false,

                Err(error) => {
                    return Err(
                        format!(
                            "Unable to check existing XMRig: {error}"
                        )
                    );
                }
            }
        }
        else {
            false
        }
    };


    if existing_running {

        return Ok(
            "OK ALREADY_ACTIVE"
                .to_string()
        );
    }


    if miner.is_some() {
        *miner = None;
    }


    let address =
        address.trim();

    let daemon =
        daemon.trim();


    if address.is_empty()
        || address
            .chars()
            .any(
                char::is_whitespace,
            )
    {
        return Err(
            "Invalid Safex Address argument."
                .to_string()
        );
    }


    if daemon.is_empty()
        || daemon
            .chars()
            .any(
                char::is_whitespace,
            )
    {
        return Err(
            "Invalid daemon argument."
                .to_string()
        );
    }

    let cpu_hint =
    match profile {
        "calm" =>
            40,

        "balanced" =>
            70,

        "full" =>
            100,

        _ => {
            return Err(
                "Invalid mining profile."
                    .to_string()
            );
        }
    };

    let backend_dir =
        mining_backend_dir()?;


    let xmrig_path =
        backend_dir.join(
            "safex-xmrig-x86_64-pc-windows-msvc.exe",
        );


    let driver_path =
        backend_dir.join(
            "WinRing0x64.sys",
        );


    if !xmrig_path.exists() {

        return Err(
            format!(
                "Safex XMRig binary not found: {}",
                xmrig_path.display()
            )
        );
    }


    if !driver_path.exists() {

        return Err(
            format!(
                "WinRing0 driver not found: {}",
                driver_path.display()
            )
        );
    }

    let job =
        create_kill_on_close_job()?;

    let mut child =
        TokioCommand::new(
            &xmrig_path,
        )
        .current_dir(
            &backend_dir,
        )
        .arg(
            "--daemon",
        )
        .arg(
            "--algo=rx/sfx",
        )
        .arg(
            "--url",
        )
        .arg(
            daemon,
        )
        .arg(
            "--user",
        )
        .arg(
            address,
        )
        .arg(
            format!(
                "--cpu-max-threads-hint={cpu_hint}"
            ),
        )
        .arg(
            "--no-color",
        )
        .arg(
            "--print-time=5",
        )
        .stdout(
            Stdio::piped(),
        )
        .stderr(
            Stdio::piped(),
        )
        .spawn()
        .map_err(|error| {
            format!(
                "Unable to launch Safex XMRig: {error}"
            )
        })?;

let process_id =
    match child.id() {

        Some(process_id) =>
            process_id,

        None => {

            let _ =
                child
                    .kill()
                    .await;

            let _ =
                child
                    .wait()
                    .await;


            return Err(
                "Unable to obtain XMRig process ID."
                    .to_string()
            );
        }
    };


if let Err(error) =
    assign_process_to_job(
        &job,
        process_id,
    )
{

    let _ =
        child
            .kill()
            .await;

    let _ =
        child
            .wait()
            .await;


    return Err(
        error,
    );
}

    let stdout =
        child
            .stdout
            .take()
            .ok_or_else(|| {
                "Unable to capture XMRig stdout."
                    .to_string()
            })?;


    let stderr =
        child
            .stderr
            .take()
            .ok_or_else(|| {
                "Unable to capture XMRig stderr."
                    .to_string()
            })?;


    let telemetry =
        Arc::new(
            Mutex::new(
                MinerTelemetry::default(),
            ),
        );


    spawn_miner_output_reader(
        stdout,
        telemetry.clone(),
    );

    spawn_miner_output_reader(
        stderr,
        telemetry.clone(),
    );


    let mut process =
        MinerProcess {
            child,
            telemetry,
            _job: job,
        };


    /*
       MSR optimisation is mandatory for
       The Safex Mine.

       Do not report a successful start
       until XMRig explicitly confirms it.
    */
    for _ in 0..120 {

        if let Some(status) =
            process
                .child
                .try_wait()
                .map_err(|error| {
                    format!(
                        "Unable to check XMRig startup: {error}"
                    )
                })?
        {
            return Err(
                format!(
                    "XMRig exited during startup ({status}) | {}",
                    telemetry_summary(
                        &process.telemetry,
                    )
                )
            );
        }


        let (
            msr_ok,
            msr_failed,
        ) = {

            let telemetry =
                process
                    .telemetry
                    .lock()
                    .map_err(|_| {
                        "XMRig telemetry lock failed."
                            .to_string()
                    })?;

            (
                telemetry.msr_ok,
                telemetry.msr_failed,
            )
        };


        if msr_failed {

            let summary =
                telemetry_summary(
                    &process.telemetry,
                );


            /*
            MSR optimisation is desirable but
            not required for mining.

            Some Windows systems prevent direct
            MSR writes through VBS/hypervisor
            security. Continue mining at the
            reduced hashrate instead of refusing
            to start.
            */
            *miner =
                Some(
                    process,
                );


            return Ok(
                format!(
                    "OK STARTED_DEGRADED | {summary}"
                )
            );
        }


        if msr_ok {

            let summary =
                telemetry_summary(
                    &process.telemetry,
                );


            *miner =
                Some(
                    process,
                );


            return Ok(
                format!(
                    "OK STARTED | {summary}"
                )
            );
        }


        sleep(
            Duration::from_millis(
                100,
            ),
        )
        .await;
    }


    let summary =
        telemetry_summary(
            &process.telemetry,
        );


    let _ =
        stop_miner_process(
            &mut process,
        )
        .await;


    Err(
        format!(
            "MSR optimisation was not confirmed within 12 seconds | {summary}"
        )
    )
}

async fn run_persistent_session(
    pipe_name: String,
    token: String,
) -> Result<(), String> {

    let client =
        connect_to_pipe(
            &pipe_name,
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to connect to Safex Mine pipe: {error}"
            )
        })?;

    let (
        reader,
        mut writer,
    ) =
        tokio::io::split(
            client,
        );

    let mut reader =
        BufReader::new(
            reader,
        );


    writer
        .write_all(
            format!(
                "HELLO {token}\n"
            )
            .as_bytes(),
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to send persistent handshake: {error}"
            )
        })?;

    writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush persistent handshake: {error}"
            )
        })?;


    let mut session_command =
        String::new();

    let count =
        reader
            .read_line(
                &mut session_command,
            )
            .await
            .map_err(|error| {
                format!(
                    "Unable to read session command: {error}"
                )
            })?;

    if count == 0 {
        return Err(
            "Safex Mine closed the pipe during session setup."
                .to_string()
        );
    }

    if session_command.trim()
        != "SESSION"
    {
        return Err(
            format!(
                "Unexpected session command: {}",
                session_command.trim()
            )
        );
    }


    writer
        .write_all(
            b"SESSION READY ELEVATED\n",
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to acknowledge session: {error}"
            )
        })?;

    writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush session acknowledgement: {error}"
            )
        })?;


let mut miner:
    Option<MinerProcess> =
    None;


    loop {

        let mut command =
            String::new();

        let count =
            reader
                .read_line(
                    &mut command,
                )
                .await
                .map_err(|error| {
                    format!(
                        "Unable to read helper command: {error}"
                    )
                })?;


        /*
   Main application disappeared.

   Gracefully stop XMRig first, then
   allow the elevated helper to exit.
*/
if count == 0 {

    let _ =
        stop_miner(
            &mut miner,
        )
        .await;

    return Ok(());
}


let command =
    command.trim();


/*
   SHUTDOWN gets special handling because
   the helper itself exits afterwards.
*/
if command
    == "SHUTDOWN"
{

    let _ =
        stop_miner(
            &mut miner,
        )
        .await;


    writer
        .write_all(
            b"OK SHUTDOWN\n",
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to acknowledge shutdown: {error}"
            )
        })?;


    writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush shutdown acknowledgement: {error}"
            )
        })?;


    return Ok(());
}


let response:
    String =

    if command
        == "STATUS"
    {

        match miner_status(
            &mut miner,
        )
        .await
        {
            Ok(response) =>
                response,

            Err(error) =>
                format!(
                    "ERR {error}"
                ),
        }
    }

    else if command
        == "STOP"
    {

        match stop_miner(
            &mut miner,
        )
        .await
        {
            Ok(response) =>
                response,

            Err(error) =>
                format!(
                    "ERR {error}"
                ),
        }
    }

    else if let Some(
        parameters
    ) =
        command
            .strip_prefix(
                "START ",
            )
    {

        let mut parts =
            parameters
                .splitn(
                    3,
                    ' ',
                );


        let address =
            parts
                .next()
                .unwrap_or_default();


        let daemon =
            parts
                .next()
                .unwrap_or_default();

        let profile =
            parts
                .next()
                .unwrap_or_default();

        if address.is_empty()
            || daemon.is_empty()
            || profile.is_empty()
        {
            (
                "ERR START requires \
                 Safex Address, daemon and mining profile"
            )
            .to_string()
        }
        else {

            match start_miner(
                address,
                daemon,
                profile,
                &mut miner,
            )
            .await
            {
                Ok(response) =>
                    response,

                Err(error) =>
                    format!(
                        "ERR {error}"
                    ),
            }
        }
    }

    else {

        "ERR UNKNOWN_COMMAND"
            .to_string()
    };


        writer
            .write_all(
                format!(
                    "{response}\n"
                )
                .as_bytes(),
            )
            .await
            .map_err(|error| {
                format!(
                    "Unable to send helper response: {error}"
                )
            })?;

        writer
            .flush()
            .await
            .map_err(|error| {
                format!(
                    "Unable to flush helper response: {error}"
                )
            })?;
    }
}


#[tokio::main]
async fn main() {

    println!(
        "The Safex Mine Helper"
    );

    println!(
        "---------------------"
    );


    match is_process_elevated() {

        Ok(true) => {
            println!(
                "Elevation: Administrator"
            );
        }

        Ok(false) => {

            eprintln!(
                "Elevation: NOT elevated"
            );

            process::exit(2);
        }

        Err(error) => {

            eprintln!(
                "Unable to determine elevation: {error}"
            );

            process::exit(3);
        }
    }


    let pipe_name =
        get_argument("--pipe");

    let token =
        get_argument("--token");


    /*
       Original manual elevation probe.
    */
    if pipe_name.is_none()
        && token.is_none()
    {
        println!(
            "Helper elevation probe: SUCCESS"
        );

        println!();

        println!(
            "This window will close in 8 seconds."
        );

        thread::sleep(
            Duration::from_secs(8),
        );

        return;
    }


    let Some(pipe_name) =
        pipe_name
    else {

        eprintln!(
            "Missing --pipe argument."
        );

        process::exit(4);
    };


    let Some(token) =
        token
    else {

        eprintln!(
            "Missing --token argument."
        );

        process::exit(5);
    };


    println!(
        "Connecting to The Safex Mine..."
    );


    if has_argument(
        "--persistent",
    ) {

        println!(
            "Persistent helper session requested."
        );


        match run_persistent_session(
            pipe_name,
            token,
        )
        .await
        {
            Ok(()) => {

                println!(
                    "Persistent helper session closed."
                );
            }

            Err(error) => {

                eprintln!(
                    "Persistent helper session failed: {error}"
                );

                thread::sleep(
                    Duration::from_secs(5),
                );

                process::exit(6);
            }
        }

        return;
    }


    /*
       Existing one-shot secure pipe probe.
    */
    match run_pipe_probe(
        pipe_name,
        token,
    )
    .await
    {
        Ok(()) => {

            println!(
                "Secure pipe probe: SUCCESS"
            );

            thread::sleep(
                Duration::from_secs(2),
            );
        }

        Err(error) => {

            eprintln!(
                "Secure pipe probe failed: {error}"
            );

            thread::sleep(
                Duration::from_secs(5),
            );

            process::exit(6);
        }
    }
}