use std::{
    io,
    mem::size_of,
    process,
    thread,
    time::Duration,
};

use tokio::{
    io::{
        AsyncBufReadExt,
        AsyncWriteExt,
        BufReader,
    },
    net::windows::named_pipe::{
        ClientOptions,
        NamedPipeClient,
    },
    time::sleep,
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
    System::Threading::{
        GetCurrentProcess,
        OpenProcessToken,
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


async fn connect_to_pipe(
    pipe_name: &str,
) -> io::Result<NamedPipeClient> {

    /*
       UAC startup can take a moment.
       Retry briefly if the pipe is busy
       or not yet visible.
    */
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

    /*
       First message proves that the
       helper knows the per-launch token.
    */
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
       No pipe arguments means this is the
       original manual elevation probe.
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