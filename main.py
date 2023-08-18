import asyncio
from agentmemory import create_memory, search_memory

from upstreet import Agent

import outlines.text.generate as generate
import outlines.models as models

model = models.transformers("gpt2")

import asyncio


class Bot:
    def __init__(self):
        self.agent = Agent()
        self.agent.events.on_event += self.on_message

    async def run(self):
        await self.agent.connect()
        while True:  # Execute 10 random actions
            if self.agent.ready is False:
                print("Waiting for engine to start...")
                await asyncio.sleep(5)
                continue

            if model is None:
                continue

            # memories = search_memory('memories', 'some text to search by')

            # answer = generate.continuation(model, stop=["\n\n"])(
            #     "Pick a number between one and ten:"
            # )
            # print(answer)
            # await self.agent.speak(answer)

            await asyncio.sleep(1)  # Wait for 1 second between actions
            # if the user presses ctrl c, break
            try:
                pass
            except KeyboardInterrupt:
                break
        await self.agent.disconnect()

    def on_message(self, message):
        print("Received message:", message)
        asyncio.run(self.agent.speak("I got a message"))
        create_memory('memories', str(message))


if __name__ == "__main__":
    bot = Bot()
    asyncio.run(bot.run())
