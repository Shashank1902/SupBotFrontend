import { useState, useRef, useEffect } from "react";
import axios from "axios";

import "./chatbot.css";
import Message from "./Message/Message";

function Chatbot() {
  const [botMsg, setBotMsg] = useState("");
  const [clientMsg, setClientMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [mic, setMic] = useState(false);

  const lang = "en";
  const [toLang, setToLang] = useState("en");

  const selectLang = (e) => {
    console.log(e.target.value);
    setToLang(e.target.value);
  };

  const message = useRef();

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = toLang;

  const inputVoice = () => {
    recognition.start();
    setMic(true);
  };

  recognition.onstart = () => {
    console.log("started");
  };

  recognition.onerror = (error) => {
    console.log(error);
  };

  recognition.onend = () => {
    recognition.start();
  };

  recognition.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    handleClientMsg(transcript);
    handleClick(event, transcript);
  };

  const translate = async (data, from, to) => {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      body: JSON.stringify({
        q: data,
        source: from,
        target: to,
        format: "text",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();

    return result.translatedText;
  };

  const handleClientMsg = (clientMsg = message.current.value) => {
    setClientMsg(clientMsg);
    messages.push({ isClient: true, msgTxt: clientMsg });
  };

  const synth = window.speechSynthesis;

  const handleClick = (e, input = message.current.value) => {
    if (e.type === "click") {
      handleClientMsg(input);
    }

    e.preventDefault();
    setInputMsg("");

    const translatedInput = translate(input, toLang, lang);
    translatedInput.then((res) => {
      console.log(res);
      console.log(res);

      axios
        .post("http://localhost:8000/chatbot", { message: res })
        .then((response) => {
          // messages.push({ isClient: false, msgTxt: response.data });
          // setBotMsg(response.data);

          if (response.data.toLowerCase().includes("google")) {
            let query = input.toLowerCase().replace("google", "");
            let googleMsg = (
              <div>
                Google search for: {`${query}`} <br />{" "}
                <a
                  href={`http://google.com/search?q=${query}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Click Here
                </a>
              </div>
            );
            messages.push({ isClient: false, msgTxt: googleMsg });

            setBotMsg(response.data);

            var utterThis = new SpeechSynthesisUtterance(
              `Google search for ${query}, click the following link`
            );
            utterThis.lang = toLang;
            synth.speak(utterThis);
          } else {
            const translateResult = translate(response.data, lang, toLang);
            translateResult.then((res) => {
              messages.push({ isClient: false, msgTxt: res });

              setBotMsg(res);

              var utterThis = new SpeechSynthesisUtterance(res);
              utterThis.lang = toLang;
              synth.speak(utterThis);
            });
          }
        });
    });
  };

  const messageEl = useRef(null);

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: "smooth" });
      });
    }
  }, []);

  return (
    <>
      <div className="chatbot-wrapper">
        <div className="title-cont">
          <div className="title">SupBot!</div>
          <div className="bot-img-cont">
            <img className="bot-img" src="images/bot.png" alt="" srcset="" />
          </div>
        </div>

        <div className="mid-chat-sec">
          <div className="chatbot-container">
            <div className="message-container" ref={messageEl}>
              {messages.map((clientMessage, i) => (
                <Message
                  key={i}
                  isClient={clientMessage.isClient}
                  msg={clientMessage.msgTxt}
                />
              ))}
            </div>
          </div>
          <div className="input-form-cont">
            <form onSubmit={handleClick} className="input-wrapper">
              <div className="input-container">
                <input
                  id="inputMsgForm"
                  className="message-input"
                  type="text"
                  placeholder="Type your message here"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  ref={message}
                />
                <div className="voice-con">
                  <span
                    className={mic ? "disablbe-mic" : "input-mic"}
                    onClick={inputVoice}
                  >
                    <i
                      className={
                        mic ? "fas fa-microphone-slash" : "fas fa-microphone"
                      }
                    ></i>
                  </span>
                </div>
                <button
                  className="submit-button"
                  onClick={handleClick}
                  type="submit"
                >
                  {/* <i className="fas fa-angle-double-right"></i> */}
                  <img src="images/union.png" alt="" srcset="" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="right-sec">
          <div className="sel-lang-cont">
            <label>
              Select language:
              <select onChange={selectLang}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="fr">French</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
