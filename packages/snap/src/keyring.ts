import { Address, toChecksumAddress } from "@ethereumjs/util";
import { emitSnapKeyringEvent, EthAccountType, EthMethod, Keyring, KeyringAccount, KeyringEvent, KeyringRequest, SubmitRequestResponse } from "@metamask/keyring-api";
import { Json, JsonRpcRequest, NotificationType } from "@metamask/snaps-sdk";
import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';
import { saveState } from "./state";

export type KeyringState = {
    wallets: Record<string, Wallet>;
};
  
export type Wallet = {
  account: KeyringAccount;
  privateKey: string;
};

export class MySnapKeyring implements Keyring {
    #state: KeyringState;

constructor(state: KeyringState) {
    this.#state = state;
}

async listAccounts(): Promise<KeyringAccount[]> {
    console.log(`List Accounts`);

    return Object.values(this.#state.wallets).map((wallet) => wallet.account);
}

async getAccount(id: string): Promise<any> {
    console.log(`Get Account: ${id}`);

    if (!this.#state.wallets[id]?.account) {
        throw new Error(`Account '${id}' not found`);
    }

    return (
        this.#state.wallets[id]?.account
    );
}

async createAccount(options: Record<string, Json>): Promise<KeyringAccount> {
    // For creating an account we will hit WaaS API
    console.log(`CreateAccount: ${JSON.stringify(options)}`);

    const privateKeyBuffer = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));

    const address = toChecksumAddress(
      Address.fromPrivateKey(privateKeyBuffer).toString(),
    );

    const privateKey = privateKeyBuffer.toString('hex');

    const account: KeyringAccount = {
    id: uuid(),
    options,
    address,
    methods: [
        EthMethod.PersonalSign,
        EthMethod.Sign,
        EthMethod.SignTransaction,
        EthMethod.SignTypedDataV1,
        EthMethod.SignTypedDataV3,
        EthMethod.SignTypedDataV4,

    ],
    type: EthAccountType.Eoa,
    };

    await emitSnapKeyringEvent(snap, KeyringEvent.AccountCreated, { account });

    this.#state.wallets[account.id] = { account, privateKey };

    await saveState(this.#state);

    return account;
}

filterAccountChains(id: string, chains: string[]): Promise<string[]> {
    throw new Error('Method not implemented.');
}

updateAccount(account: KeyringAccount): Promise<void> {
    throw new Error('Method not implemented.');
}

deleteAccount(id: string): Promise<void> {
    throw new Error('Method not implemented.');
}

exportAccount?(id: string): Promise<KeyringAccount> {
    throw new Error('Method not implemented.');
}

listRequests?(): Promise<KeyringRequest[]> {
    throw new Error('Method not implemented.');
}

getRequest?(id: string): Promise<any> {
    throw new Error('Method not implemented.');
}

async submitRequest(request: KeyringRequest): Promise<SubmitRequestResponse> {
    await snap.request({
        method: 'snap_notify',
        params: {
          type: NotificationType.InApp,
          message: `SRI-Method:${request.request.method}`,
        },
      });
    
    const { method, params = [] } = request.request as JsonRpcRequest;
    
    console.log(`Method: ${JSON.stringify(method, null, 4)}`);
    console.log(`Params: ${JSON.stringify(params, null, 4)}`);

    await snap.request({
        method: 'snap_notify',
        params: {
          type: NotificationType.InApp,
          message: `Submit Request Finish`,
        },
      });

    return {
      pending: false,
      result: "0x9aef363b17bc18dfbdcb9ed3ce5f9f96788ce84b353d262099e90c4fa0b513a4e21ee47bafa04c0630750e901b62bd4839b45219c191ec6076d6549637cb1beb4c",
    };
}

approveRequest?(id: string, data?: Record<string, Json> | undefined): Promise<void> {
    throw new Error('Method not implemented.');
}

rejectRequest?(id: string): Promise<void> {
    throw new Error('Method not implemented.');
}
}
