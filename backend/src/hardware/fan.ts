import { execFile } from "node:child_process";


const FAN_GPIO = "18";


function setGPIO(
    value: "dh" | "dl"
): Promise<void> {

    return new Promise(
        (resolve, reject) => {

            execFile(
                "pinctrl",
                [
                    "set",
                    FAN_GPIO,
                    "op",
                    "pn",
                    value,
                ],
                (error) => {

                    if (error) {

                        console.error(
                            "GPIO Fehler:",
                            error
                        );

                        reject(
                            error
                        );

                        return;
                    }

                    resolve();
                }
            );

        }
    );
}


export async function fanOn() {

    await setGPIO(
        "dh"
    );

}


export async function fanOff() {

    await setGPIO(
        "dl"
    );

}