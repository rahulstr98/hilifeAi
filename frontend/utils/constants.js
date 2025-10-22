import React from "react";
import ApplicationStack from "./routes/ApplicationStack";
import TaskRoute from "./routes/TaskRoute";

export const APPS = [
    {
        subdomain: "www",
        app: ApplicationStack,
        main: true
    },
    {
        subdomain: "task",
        app: TaskRoute,
        main: false
    }

]

