// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import ollama from "ollama";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "deepseek-chat" is now active!');
  vscode.window.showInformationMessage("Hello World from deepseek-chat!");

  const panel = vscode.window.createWebviewPanel(
    "deepseek-chat", // Identifies the type of the webview. Used internally
    "DeepSeek Chat", // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    {
      enableForms: true,
      enableScripts: true,
    }
  );

  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.type === "user-prompt") {
      const { text } = message;

      const stream = await ollama.chat({
        model: "deepseek-r1:1.5b",
        messages: [{ role: "user", content: text }],
        stream: true,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const { content } = chunk.message;
        fullResponse += content;
        panel.webview.postMessage({ type: "agent", text: fullResponse });
      }
    }
  });

  panel.webview.html = /*html*/ `
<html>
  <head>
    <style>
      body {
        font-family: sans-serif;
        padding: 20px;
      }

      input {
        min-width: 50vw;
      }

    </style>
  </head>
  <body>
    <h1>Hello from Deepseek</h1>
    <form>
      <input name="prompt" placeholder="ask me anything..." />
      <button type="submit">Submit</button>
      <div id="response" />
    </form>
  </body>

  <script>
    const vscode = acquireVsCodeApi();

    document.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const prompt = document.querySelector("input").value;
      vscode.postMessage({ type: "user-prompt", text: prompt });
    })

    window.addEventListener("message", (event) => {
      const message = event.data

      if (message.type === "agent") {
        document.querySelector("#response").innerHTML = marked.parse(message.text);
      }
    })

  </script>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" async></script>

</html>
  `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
