import {
  query,
  update,
  Record,
  text,
  Opt,
  nat64,
  StableBTreeMap,
  Variant,
  Canister,
  Result,
  Err,
  ic,
  Ok,
  Vec,
} from "azle";
import { v4 as uuidv4 } from "uuid";
const message = Record({
  id: text,
  title: text,
  body: text,
  attachmentURL: text,
  createdAt: nat64,
});

type message = typeof message.tsType;

//define errors

const messageErrors = Variant({
  failed: text,
  missingCredentials: text,
  messagenotfound: text,
});

//define type of message errors
type messageErrors = typeof messageErrors.tsType;

//define payloads to e passed

const messagePayload = Record({
  title: text,
  body: text,
  attachmentURL: text,
});

//delete message payload
const deleteMessagePayload = Record({
  messageid: text,
});
//get message payload

const getMessagePayload = Record({
  messageid: text,
});
const messagesStorage = StableBTreeMap<string, message>(0);
export default Canister({
  //add message

  addmessage: update(
    [messagePayload],
    Result(text, messageErrors),
    (payload) => {
      //check if all the details are available

      if (!payload.attachmentURL || !payload.body || !payload.title) {
        return Err({ missingCredentials: "some credentials are missing" });
      }

      //create a new message
      const new_message: message = {
        id: uuidv4(),
        title: payload.title,
        body: payload.body,
        attachmentURL: payload.attachmentURL,
        createdAt: ic.time(),
      };

      //update message storage with new message

      messagesStorage.insert(new_message.id, new_message);
      return Ok("message sent");
    }
  ),

  //function to get all messages

  get_all_messages: query([], Vec(message), () => {
    return messagesStorage.values();
  }),

  //function to delete message

  delete_message: update(
    [deleteMessagePayload],
    Result(text, messageErrors),
    (payload) => {
      //check if the message id is available
      if (!payload.messageid) {
        return Err({ missingCredentials: "some credentials are missing" });
      }

      //get message

      let message = messagesStorage.get(payload.messageid).Some;

      if (!message) {
        return Err({ messagenotfound: "messagenotfound" });
      }
      messagesStorage.remove(payload.messageid);
      return Ok("message deleted");
    }
  ),

  //get message based on id
  get_message: query(
    [getMessagePayload],
    Result(message, messageErrors),
    (payload) => {
      //check if the message id is available
      if (!payload.messageid) {
        return Err({ missingCredentials: "some credentials are missing" });
      }

      //get message

      let message = messagesStorage.get(payload.messageid).Some;

      if (!message) {
        return Err({ messagenotfound: "messagenotfound" });
      }

      return Ok(message);
    }
  ),
});
