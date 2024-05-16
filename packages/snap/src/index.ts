import { handleKeyringRequest} from '@metamask/keyring-api';
import type {  OnKeyringRequestHandler, OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  DialogType,
  ManageStateOperation,
  NotificationType,
  panel,
  text,
} from '@metamask/snaps-sdk';
import { MySnapKeyring } from './keyring';
import { getState } from './state';

let keyring: MySnapKeyring;

const retrtieveDataFromServer = async (params: {
  accessToken: string;
}): Promise<any> => {
  return Promise.resolve({
    firstName: 'Facundo',
    lastName: 'La Rocca',
  });
};

async function getKeyring(): Promise<MySnapKeyring> {
  if (!keyring) {
    const state = await getState();
    if (!keyring) {
      keyring = new MySnapKeyring(state);
    }
  }
  return keyring;
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'dialog':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([
            text(`Hello, **${request.params['firstName']}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });

    case 'notify':
      return snap.request({
        method: 'snap_notify',
        params: {
          type: NotificationType.InApp,
          message: `Hello, **${request.params['firstName']}**!`,
        },
      });

    case 'store_data': {
      const data = await retrtieveDataFromServer({
        accessToken: request.params['accessToken'],
      });

      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.UpdateState,
          newState: data,
        },
      });

      return data;
    }

    case 'retrieve_data':
      return await snap.request({
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.GetState,
        },
      });

    default:
      throw new Error('Method not found.');
  }
};

export const onKeyringRequest: OnKeyringRequestHandler = async ({
  origin,
  request,
}) => {
  console.debug(
    `Keyring request (origin="${origin}"):`,
    JSON.stringify(request, null, 4),
  );

  // // Check if origin is allowed to call method.
  // if (!hasPermission(origin, request.method)) {
  //   throw new Error(
  //     `Origin '${origin}' is not allowed to call '${request.method}'`,
  //   );
  // }

  // Handle keyring methods.
  return handleKeyringRequest(await getKeyring(), request);
};