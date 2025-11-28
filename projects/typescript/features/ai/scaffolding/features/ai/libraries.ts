import { Os } from "./libraries/os/os.library";
import { Agent } from "./libraries/agent/agent.library";
import { AgentOptions } from "./classes/Agent";
import { Screen } from "./libraries/screen/screen.library";
import { Image } from "./libraries/image/image.library";
import { Time } from "./libraries/time/time.library";
import { Apps } from "./libraries/apps/apps.library";
//* Imports

export default <AgentOptions>{
    audio: {
        sources: ["alsa_input.pci-0000_01_00.6.analog-stereo"]
    },
    lib: [
        Os,
        Agent,
        Screen,
        Image,
        Time,
        Apps,
        //* Libraries
    ]
}