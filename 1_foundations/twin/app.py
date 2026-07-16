import os
from openai import OpenAI
from context import TWIN_SYSTEM_PROMPT
from tools import tools, handle_tool_calls
from styles import CSS, JS, EXAMPLES
from dotenv import load_dotenv
import gradio as gr

load_dotenv(override=True)

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

MODEL_NAME = "llama-3.3-70b-versatile"

system = [{"role": "system", "content": TWIN_SYSTEM_PROMPT}]

def chat(message, history):
    formatted_history = []
    for item in history:
        if isinstance(item, (list, tuple)) and len(item) >= 2:
            human, assistant = item[0], item[1]
        elif isinstance(item, dict):
            human = item.get("user", "")
            assistant = item.get("bot", "")
        else:
            continue
            
        formatted_history.append({"role": "user", "content": human})
        formatted_history.append({"role": "assistant", "content": assistant})
    
    messages = system + formatted_history + [{"role": "user", "content": message}]
    
    response = client.chat.completions.create(model=MODEL_NAME, messages=messages, tools=tools)
    
    while response.choices[0].finish_reason == "tool_calls" and response.choices[0].message.tool_calls:
        message_obj = response.choices[0].message
        tool_calls = message_obj.tool_calls
        results = handle_tool_calls(tool_calls)
        
        messages.append(message_obj)
        messages.extend(results)
        
        response = client.chat.completions.create(model=MODEL_NAME, messages=messages, tools=tools)
    
    return response.choices[0].message.content

if __name__ == "__main__":
    gr.ChatInterface(
        chat,
        examples=EXAMPLES,
        title="Digital Twin",
        description="Talk to my AI twin about my career",
        chatbot=gr.Chatbot(show_label=False),
    ).launch(css=CSS, js=JS, theme=gr.themes.Base())