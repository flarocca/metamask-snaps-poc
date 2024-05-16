import { ManageStateOperation } from "@metamask/snaps-sdk";
import { KeyringState } from "./keyring";

const defaultState: KeyringState = {
    wallets: {}
};

export async function getState(): Promise<KeyringState> {
    const state = (await snap.request({
      method: 'snap_manageState',
      params: { operation: ManageStateOperation.GetState },
    })) as any;
  
    console.log('Retrieved state:', JSON.stringify(state));
  
    return {
      ...defaultState,
      ...state,
    };
  }

  export async function saveState(state: KeyringState) {
    await snap.request({
      method: 'snap_manageState',
      params: { operation: ManageStateOperation.UpdateState, newState: state },
    });
  }