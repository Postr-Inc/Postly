//@ts-nocheck
"use client";
import { Props } from "../../src/@types/types";
import Page from "../../src/components/shared/page";
import { useEffect, useState } from "react";

async function train(Session: any) {
  const promptString = `what is your name?`;
  try {
    let res = await Session.prompt(promptString);
    console.log("AI training response:", res);

    return res;
  } catch (error) {
    console.error("Error during training:", error);
  }
}

export default function AI(props: Props) {
  if (typeof window === "undefined") return null;

  let hasInbuiltAi = window.hasOwnProperty("ai");
  let [ai, setAi] = useState<any>(null);
  let [isTraining, setIsTraining] = useState<boolean>(false);

  async function init() {
    if (hasInbuiltAi) {
      try {
        const info = await window.ai.textModalInfo(); 
        let session = await window.ai.createTextSession({
          initialPrompts: [
            {
              role: "system",
              content: "Ensure each response matches the intitalPrompts given ",
            },
            {
              role: "user",
              content: "how are you?",
            },
            {
              role: "assistant",
              content: "I'm good, how can I help you today?",
            },
    
            {
              role: "user",
              content: "what is your name?",
            },
            {
              role: "assistant",
              content: "I'm an AI assistant, I don't have a name.",
            },
          ],
          temperature: Math.max(info.defaultTemperature * 1.2, 1.0),
        });
        console.log(ai.textModalInfo())
        setAi(session);
      } catch (error) {
        console.error("Error creating AI session:", error);
      }
    }
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (ai) {
      setIsTraining(true);
      train(ai).finally(() => setIsTraining(false));
    }
  }, [ai]);

  return (
    <Page {...props}>
      <div className="flex flex-col gap-5 w-full p-2 xl:w-[35vw] md:w-[50vw] xl:mx-24">
        <p className="text-xl font-bold">AI</p>
        <p className="text-xl flex flex-col">
          <div className="flex flex-col gap-2">
            <label>Enable AI Curated Posts</label>
            <p className="text-sm">
              AI curated posts are generated by an AI model that learns from
              your interactions with the app.
            </p>
            <input type="checkbox" className="toggle rounded-full" />

            <br />

            <label>
              Enable AI Sync{" "}
              {!hasInbuiltAi && (
                <span className="text-red-500"> (Not supported)</span>
              )}
            </label>
            <p className="text-sm">
              AI sync allows you to utilize on-device AI from any other device
              you own that has Postr installed.
            </p>
            {hasInbuiltAi && (
              <input type="checkbox" className="toggle rounded-full" />
            )}
          </div>
        </p>
        {isTraining && (
          <p className="text-sm text-blue-500">Training AI, please wait...</p>
        )}
      </div>
    </Page>
  );
}