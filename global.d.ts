import { Low } from "@commonify/lowdb";
import { DatabaseType } from "./core/serialize";
import { chain } from "lodash";
export interface low extends Low<DatabaseType> {
    READ?: boolean
    chain?: Partial<typeof chain>
}

type IBotData = {
    id: string,
    time: number

}
declare namespace globalThis {
    let db: low

}
