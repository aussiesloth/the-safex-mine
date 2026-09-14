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


    /*
       This is only simulated state for
       Stage 4.

       Stage 5 will replace this boolean
       with the actual XMRig process.
    */
    let mut active =
        false;


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
           Do not leave the helper orphaned.
        */
        if count == 0 {
            return Ok(());
        }


        let command =
            command.trim();


        let response =
            match command {

                "STATUS" => {

                    if active {
                        "STATUS ACTIVE"
                    } else {
                        "STATUS IDLE"
                    }
                }


                "START" => {

                    if active {
                        "OK ALREADY_ACTIVE"
                    } else {
                        active = true;
                        "OK STARTED"
                    }
                }


                "STOP" => {

                    if active {
                        active = false;
                        "OK STOPPED"
                    } else {
                        "OK ALREADY_STOPPED"
                    }
                }


                "SHUTDOWN" => {

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


                _ => {
                    "ERR UNKNOWN_COMMAND"
                }
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