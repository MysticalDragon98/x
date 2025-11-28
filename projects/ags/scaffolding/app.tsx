import app from "ags/gtk4/app"
import style from "./style.css"
import { Environment } from "./features/env"

app.start({
  instanceName: Environment.InstanceName,
  css: style,
  main() {
    return <window visible>
      
    </window>
  },
})
