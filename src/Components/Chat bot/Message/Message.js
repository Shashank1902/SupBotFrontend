import "./message.css";

function Message({ isClient, msg }) {
  // console.log(isClient, msg);
  return (
    <>
      <div className={isClient ? "clientMsg" : "botMsg"}>
        <div className="msg-box">{msg}</div>
        <div className="message-avatar-container">
          <img
            className="message-avatar"
            src="images/chatbotAvatarMale.png"
            alt=""
          />
        </div>
      </div>
    </>
  );
}

export default Message;
