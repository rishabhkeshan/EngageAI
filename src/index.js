import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import Axios from "axios";

const App = () => {
  React.useEffect(() => {
    document.title = "Engage";
  });
  const [theme, setTheme] = React.useState("dark");
  const themeVars =
    theme === "dark"
      ? {
          app: { backgroundColor: "#D1B2C0" },
          terminal: { boxShadow: "0 2px 5px #111", borderRadius: "5px" },
          window: { backgroundColor: "#000", color: "#39ff14" },
          field: {
            backgroundColor: "#000",
            color: "#39ff14",
            fontWeight: "normal",
          },
          cursor: { animation: "1.02s blink-dark step-end infinite" },
        }
      : {
          terminal: { boxShadow: "0 2px 5px #33333375" },
          window: { backgroundColor: "#5F5C6D", color: "#39ff14" },
          field: {
            backgroundColor: "#E3E3E3",
            color: "#474554",
            fontWeight: "bold",
          },
          cursor: { animation: "1.02s blink-light step-end infinite" },
        };

  return (
    <div id="app" style={themeVars.app}>
      <div style={{ marginBottom: "2vh", fontSize: "5rem" }}>EngageAI</div>
      <div style={{ fontSize: "1.5rem", marginBottom: "5vh" }}>
        The developer's friendly frustration chatbot
      </div>

      <Terminal theme={themeVars} setTheme={setTheme} />
    </div>
  );
};

/* Terminal */
const Terminal = ({ theme, setTheme }) => {
  const [maximized, setMaximized] = React.useState(false);
  const [title, setTitle] = React.useState("EngageAI");
  const handleClose = () =>
    (window.location.href = "https://codepen.io/HuntingHawk");
  const handleMinMax = () => {
    setMaximized(!maximized);
    document.querySelector("#field").focus();
  };

  return (
    <div
      id="terminal"
      style={
        maximized
          ? { height: "100vh", width: "100vw", maxWidth: "100vw" }
          : theme.terminal
      }
    >
      <div id="window" style={theme.window}>
        <button className="btn red" onClick={handleClose} />
        <button id="useless-btn" className="btn yellow" />
        <button className="btn green" onClick={handleMinMax} />
        <span id="title" style={{ color: theme.window.color }}>
          {title}
        </span>
      </div>
      <Field theme={theme} setTheme={setTheme} setTitle={setTitle} />
    </div>
  );
};

class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commandHistory: [],
      commandHistoryIndex: 0,
      fieldHistory: [
        {
          text: `Heyyy, I'm Engage, your AI buddy. Let's "chat" and get going.`,
        },
        {
          text: "Type HELP to see what all I can do.",
          hasBuffer: true,
        },
      ],
      userInput: "",
      isMobile: false,
      run: false,
    };
    this.recognizedCommands = [
      {
        command: "help",
        purpose: "Provides help information for commands.",
      },
      {
        command: "team",
        purpose: "Meet the awesome folks who brought me alive.",
      },
      {
        command: "chat",
        purpose: "Let's talk about your day.",
      },
      {
        command: "cls",
        purpose: "Clears the screen.",
      },
      {
        command: "affirmation",
        purpose: "Positive start to your day.",
      },
      {
        command: "about",
        isMain: true,
        purpose: "Get to know my tech stack.",
      },
    ];
    this.handleTyping = this.handleTyping.bind(this);
    this.handleInputEvaluation = this.handleInputEvaluation.bind(this);
    this.handleInputExecution = this.handleInputExecution.bind(this);
    this.handleContextMenuPaste = this.handleContextMenuPaste.bind(this);
  }
  componentDidMount() {
    if (
      typeof window.orientation !== "undefined" ||
      navigator.userAgent.indexOf("IEMobile") !== -1
    ) {
      this.setState((state) => ({
        isMobile: true,
        fieldHistory: [
          ...state.fieldHistory,
          { isCommand: true },
          {
            text: `Unfortunately due to this application being an 'input-less' environment, mobile is not supported. I'm working on figuring out how to get around this, so please bear with me! In the meantime, come on back if you're ever on a desktop.`,
            isError: true,
            hasBuffer: true,
          },
        ],
      }));
    }

    const userElem = document.querySelector("#field");

    // userElem.focus()

    document.querySelector("#useless-btn").addEventListener("click", () =>
      this.setState((state) => ({
        fieldHistory: [
          ...state.fieldHistory,
          { isCommand: true },
          { text: "SYS >> That button doesn't do anything.", hasBuffer: true },
        ],
      }))
    );
  }
  componentDidUpdate() {
    const userElem = document.querySelector("#field");

    userElem.scrollTop = userElem.scrollHeight;
  }
  handleTyping(e) {
    e.preventDefault();

    const { key, ctrlKey, altKey } = e;
    const forbidden = [
      ...Array.from({ length: 12 }, (x, y) => `F${y + 1}`),
      "ContextMenu",
      "Meta",
      "NumLock",
      "Shift",
      "Control",
      "Alt",
      "CapsLock",
      "Tab",
      "ScrollLock",
      "Pause",
      "Insert",
      "Home",
      "PageUp",
      "Delete",
      "End",
      "PageDown",
    ];

    if (!forbidden.some((s) => s === key) && !ctrlKey && !altKey) {
      if (key === "Backspace") {
        this.setState(
          (state) => (state.userInput = state.userInput.slice(0, -1))
        );
      } else if (key === "Escape") {
        this.setState({ userInput: "" });
      } else if (key === "ArrowUp" || key === "ArrowLeft") {
        const { commandHistory, commandHistoryIndex } = this.state;
        const upperLimit = commandHistoryIndex >= commandHistory.length;

        if (!upperLimit) {
          this.setState((state) => ({
            commandHistoryIndex: (state.commandHistoryIndex += 1),
            userInput: state.commandHistory[state.commandHistoryIndex - 1],
          }));
        }
      } else if (key === "ArrowDown" || key === "ArrowRight") {
        const { commandHistory, commandHistoryIndex } = this.state;
        const lowerLimit = commandHistoryIndex === 0;

        if (!lowerLimit) {
          this.setState((state) => ({
            commandHistoryIndex: (state.commandHistoryIndex -= 1),
            userInput:
              state.commandHistory[state.commandHistoryIndex - 1] || "",
          }));
        }
      } else if (key === "Enter") {
        const { userInput } = this.state;

        if (userInput.length) {
          this.setState(
            (state) => ({
              commandHistory:
                userInput === ""
                  ? state.commandHistory
                  : [userInput, ...state.commandHistory],
              commandHistoryIndex: 0,
              fieldHistory: [
                ...state.fieldHistory,
                { text: userInput, isCommand: true },
              ],
              userInput: "",
            }),
            () => this.handleInputEvaluation(userInput)
          );
        } else {
          this.setState((state) => ({
            fieldHistory: [...state.fieldHistory, { isCommand: true }],
          }));
        }
      } else {
        this.setState((state) => ({
          commandHistoryIndex: 0,
          userInput: (state.userInput += key),
        }));
      }
    }
  }
  handleInputEvaluation(input) {
    try {
      const evaluatedForArithmetic = Math.evaluate(input);

      if (!isNaN(evaluatedForArithmetic)) {
        return this.setState((state) => ({
          fieldHistory: [
            ...state.fieldHistory,
            { text: evaluatedForArithmetic },
          ],
        }));
      }

      throw Error;
    } catch (err) {
      const { recognizedCommands, giveError, handleInputExecution } = this;
      const cleanedInput = input.toLowerCase().trim();
      const dividedInput = cleanedInput.split(" ");
      const parsedCmd = cleanedInput;
      const parsedParams = dividedInput.slice(1).filter((s) => s[0] !== "-");
      const parsedFlags = dividedInput.slice(1).filter((s) => s[0] === "-");
      // const isError = !recognizedCommands.some(s => s.command === parsedCmd)

      // if (isError) {
      // 	return this.setState(state => ({fieldHistory: [...state.fieldHistory, giveError('nr', input)]}))
      // }

      return handleInputExecution(
        cleanedInput,
        parsedCmd,
        parsedParams,
        parsedFlags
      );
    }
  }
  handleInputExecution(fullText, cmd, params = [], flags = []) {
    if (cmd === "help") {
      if (params.length) {
        if (params.length > 1) {
          return this.setState((state) => ({
            fieldHistory: [
              ...state.fieldHistory,
              this.giveError("bp", { cmd: "HELP", noAccepted: 1 }),
            ],
          }));
        }

        const cmdsWithHelp = this.recognizedCommands.filter((s) => s.help);

        if (cmdsWithHelp.filter((s) => s.command === params[0]).length) {
          return this.setState((state) => ({
            fieldHistory: [
              ...state.fieldHistory,
              {
                text: cmdsWithHelp.filter((s) => s.command === params[0])[0]
                  .help,
                hasBuffer: true,
              },
            ],
          }));
        } else if (
          this.recognizedCommands.filter((s) => s.command === params[0]).length
        ) {
          return this.setState((state) => ({
            fieldHistory: [
              ...state.fieldHistory,
              {
                text: [
                  `No additional help needed for ${this.recognizedCommands
                    .filter((s) => s.command === params[0])[0]
                    .command.toUpperCase()}`,
                  this.recognizedCommands.filter(
                    (s) => s.command === params[0]
                  )[0].purpose,
                ],
                hasBuffer: true,
              },
            ],
          }));
        }

        return this.setState((state) => ({
          fieldHistory: [
            ...state.fieldHistory,
            this.giveError("up", params[0].toUpperCase()),
          ],
        }));
      }

      return this.setState((state) => ({
        fieldHistory: [
          ...state.fieldHistory,
          {
            text: [
              "All commands:",
              ...this.recognizedCommands
                .sort((a, b) => a.command.localeCompare(b.command))
                .map(
                  ({ command, purpose }) =>
                    `${command.toUpperCase()}${Array.from(
                      { length: 15 - command.length },
                      (x) => "."
                    ).join("")}${purpose}`
                ),
              "",
              "For help about a specific command, type HELP <CMD>, e.g. HELP PROJECT.",
            ],
            hasBuffer: true,
          },
        ],
      }));
    } else if (cmd === "cls") {
      return this.setState({ fieldHistory: [] });
    } else if (cmd === "chat") {
			  return this.setState((state) => ({
				  fieldHistory: [
					  ...state.fieldHistory,
					  {
						  text:`Enter your query, press "exit" to exit`,	
						  hasBuffer: true,
						},
					],
					run: true,
				}));
							
    //   const action = run()
    //     .then((res) => {
    //       return this.setState((state) => ({
    //         fieldHistory: [
    //           ...state.fieldHistory,
    //           { text: res.data.question, isQuestion: true, hasBuffer: true },
    //         ],
    //         run: true,
    //       }));
    //     })
    //     .catch((err) => {
    //       return this.setState((state) => ({
    //         fieldHistory: [...state.fieldHistory, this.giveError("api", "")],
    //       }));
    //     });
    } else if (cmd === "team") {
      return this.setState((state) => ({
        fieldHistory: [
          ...state.fieldHistory,
          {
            text: `The cool nerd - Rishabh Keshan(19BCE2366)`,
            hasBuffer: true,
          },
          {
            text: `The geeky techy - Anusha Verma Chandraju(19BCE0724)`,
            hasBuffer: true,
          },
          {
            text: `The whacky coder - Swamita Gupta(19BCE0728)`,
            hasBuffer: true,
          },
        ],
      }));
    } else if (cmd === "cmd") {
      return this.setState(
        (state) => ({
          fieldHistory: [
            ...state.fieldHistory,
            {
              text: "Launching new instance of the React Terminal...",
              hasBuffer: true,
            },
          ],
        }),
        () => window.open("https://localhost:3000")
      );
    } else if (cmd === "theme") {
      const { setTheme } = this.props;

      if (
        flags.length === 1 &&
        ["-d", "-dark", "-l", "-light"].some((s) => s === flags[0])
      ) {
        const themeToSet =
          flags[0] === "-d" || flags[0] === "-dark" ? "dark" : "light";

        return this.setState(
          (state) => ({
            fieldHistory: [
              ...state.fieldHistory,
              {
                text: `Set the theme to ${themeToSet.toUpperCase()} mode`,
                hasBuffer: true,
              },
            ],
          }),
          () => setTheme(themeToSet)
        );
      }

      return this.setState((state) => ({
        fieldHistory: [
          ...state.fieldHistory,
          this.giveError(!flags.length ? "nf" : "bf", "THEME"),
        ],
      }));
    } else if (cmd === "exit") {
      if (this.state.run) {
            return this.setState((state) => ({
              fieldHistory: [
                ...state.fieldHistory,
                {
                  text: `Stay positive, you got this`,
                  hasBuffer: true,
                },
              ],
              run: false,
            }));
      } else {
        return this.setState((state) => ({
          fieldHistory: [
            ...state.fieldHistory,
            this.giveError("exitnorun", cmd),
          ],
        }));
      }
    } else if (cmd === "affirmation") {
      Axios.get(
        `https://dulce-affirmations-api.herokuapp.com/affirmation`
        // "https://type.fit/api/quotes"
      ).then((res) => {
        console.log(res.data);
        const affirmation = res.data[0].phrase;
        return this.setState((state) => ({
          fieldHistory: [
            ...state.fieldHistory,
            {
              text: `${affirmation}`,
              hasBuffer: true,
            },
          ],
        }));
      });
    } else if (cmd === "about") {
      return this.setState((state) => ({
        fieldHistory: [
          ...state.fieldHistory,
          {
            text: [
              "Hey there!",
              `My name is Engage, I exist to help you boost your mood. My creators are noobs but I can't help it, they brought me alive. Anyway, are you ready to chat???`,
              'Frontend: React.js, Styled Components',
              'Backend: FAST API',
              'ML Model: Pytorch, Transformers',
            ],
            hasBuffer: true,
          },
        ],
      }));
    } else {
      if (this.state.run) {
		//   Axios.get('https://api.dialogflow.com/v1/query?v=20150910&query=' + cmd + '&lang=en&sessionId=12345')
		Axios.get(
      "http://f0ba-35-222-184-171.ngrok.io/runModello?text=" + cmd
    ).then((res) => {
      console.log(res.data);
      const answer = res.data.answer;
      return this.setState((state) => ({
        fieldHistory: [
          ...state.fieldHistory,
          {
            text: `${answer}`,
            hasBuffer: true,
          },
        ],
      }));
    });
      } else {
        return this.setState((state) => ({
          fieldHistory: [...state.fieldHistory, this.giveError("up", cmd)],
        }));
      }
    }
  }
  handleContextMenuPaste(e) {
    e.preventDefault();

    if ("clipboard" in navigator) {
      navigator.clipboard.readText().then((clipboard) =>
        this.setState((state) => ({
          userInput: `${state.userInput}${clipboard}`,
        }))
      );
    }
  }
  giveError(type, extra) {
    const err = { text: "", isError: true, hasBuffer: true };

    if (type === "nr") {
      err.text = `${extra} : The term or expression '${extra}' is not recognized. Check the spelling and try again. If you don't know what commands are recognized, type HELP.`;
    } else if (type === "nf") {
      err.text = `The ${extra} command requires the use of flags. If you don't know what flags can be used, type HELP ${extra}.`;
    } else if (type === "bf") {
      err.text = `The flags you provided for ${extra} are not valid. If you don't know what flags can be used, type HELP ${extra}.`;
    } else if (type === "bp") {
      err.text = `The ${extra.cmd} command requires ${extra.noAccepted} parameter(s). If you don't know what parameters to use, type HELP ${extra.cmd}.`;
    } else if (type === "up") {
      err.text = `The command ${extra} is not supported by the HELP utility.`;
    } else if (type === "api") {
      err.text = `Something is wrong, please try again.`;
    } else if (type === "exitnorun") {
      err.text = `"Chat" first and answer at least one question.`;
    }

    return err;
  }
  render() {
    const { theme } = this.props;
    const { fieldHistory, userInput } = this.state;

    return (
      <div
        id="field"
        className={theme.app.backgroundColor === "#333444" ? "dark" : "light"}
        style={theme.field}
        onKeyDown={(e) => this.handleTyping(e)}
        tabIndex={0}
        onContextMenu={(e) => this.handleContextMenuPaste(e)}
      >
        {fieldHistory.map(
          ({ text, isCommand, isError, hasBuffer, isEmotion, isQuestion }) => {
            if (Array.isArray(text)) {
              return (
                <MultiText
                  input={text}
                  isError={isError}
                  hasBuffer={hasBuffer}
                  isEmotion={isEmotion}
                  isQuestion={isQuestion}
                />
              );
            }

            return (
              <Text
                input={text}
                isCommand={isCommand}
                isError={isError}
                hasBuffer={hasBuffer}
                isEmotion={isEmotion}
                isQuestion={isQuestion}
              />
            );
          }
        )}
        <UserText input={userInput} theme={theme.cursor} />
      </div>
    );
  }
}
const Text = ({
  input,
  isCommand,
  isError,
  hasBuffer,
  isEmotion,
  isQuestion,
}) => (
  <>
    <div>
      {isCommand && <div id="query">Engage></div>}
      <span
        className={
          !isCommand && isError
            ? "error"
            : isEmotion
            ? "emotion"
            : isQuestion
            ? "question"
            : ""
        }
      >
        {input}
      </span>
    </div>
    {hasBuffer && <div></div>}
  </>
);
const MultiText = ({ input, isError, hasBuffer, isEmotion, isQuestion }) => (
  <>
    {input.map((s) => (
      <Text
        input={s}
        isError={isError}
        isEmotion={isEmotion}
        isQuestion={isQuestion}
      />
    ))}
    {hasBuffer && <div></div>}
  </>
);
const UserText = ({ input, theme }) => (
  <div>
    <div id="query">Me></div>
    <span>{input}</span>
    <div id="cursor" style={theme}></div>
  </div>
);

ReactDOM.render(<App />, document.querySelector("#root"));
