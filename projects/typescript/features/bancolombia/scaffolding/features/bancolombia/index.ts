import { Subject } from "rxjs";
import GmailFeature from "../gmail";
import { SetStorage } from "../storage/classes/SetStorage";
import { BancolombiaTransaction } from "./types/bancolombia-transaction.type";

export default class BancolombiaFeature {

    static $incomingTransactions: Subject<BancolombiaTransaction> = new Subject();
    
    static async watchEmails (storage: SetStorage) {
        await GmailFeature.watch(storage, async (email) => {
            const from = GmailFeature.from(email);

            if(!from.includes("Alertas y Notificaciones <alertasynotificaciones@notificacionesbancolombia.com>"))
                return;

            
            const body = email.snippet ?? "";
            const [, amount, name] = /¡Listo! Todo salió bien con tus movimientos Bancolombia\: Recibiste una transferencia por \$(\d+) de (.+?) en tu cuenta \*\*/.exec(body) ?? [];

            BancolombiaFeature.$incomingTransactions.next({
                from: name,
                amount: parseFloat(amount)
            });
        });
    }

}