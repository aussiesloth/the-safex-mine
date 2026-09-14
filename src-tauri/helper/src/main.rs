use std::{
    mem::size_of,
    process,
    thread,
    time::Duration,
};

use windows::Win32::{
    Foundation::{
        CloseHandle,
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


fn main() {
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

            println!(
                "Helper elevation probe: SUCCESS"
            );
        }

        Ok(false) => {
            eprintln!(
                "Elevation: NOT elevated"
            );

            eprintln!(
                "Helper elevation probe: FAILED"
            );

            thread::sleep(
                Duration::from_secs(8),
            );

            process::exit(2);
        }

        Err(error) => {
            eprintln!(
                "Unable to determine elevation: {error}"
            );

            thread::sleep(
                Duration::from_secs(8),
            );

            process::exit(3);
        }
    }

    println!();

    println!(
        "This window will close in 8 seconds."
    );

    thread::sleep(
        Duration::from_secs(8),
    );
}