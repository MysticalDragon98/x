import { ExecutionPlan } from "../classes/ExecutionPlan"
import { ExecutionPlanStep } from "../classes/ExecutionPlanStep"

export type ExecutionPlanEvent = {
    type: "create:start",
    input: string,
    timestamp: number
} | {
    type: "create:end",
    input: string,
    plan: ExecutionPlan,
    timestamp: number
} |{
    type: "start",
    plan: ExecutionPlan,
    timestamp: number
} | {
    type: "step:start",
    plan: ExecutionPlan,
    step: ExecutionPlanStep,
    timestamp: number
} | {
    type: "step:end",
    plan: ExecutionPlan,
    step: ExecutionPlanStep,
    timestamp: number
} | {
    type: "end",
    plan: ExecutionPlan,
    timestamp: number
};