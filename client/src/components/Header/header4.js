import React from "react";
import history from "../Navigation/history";

export default function Header4() {
  const onClick = (e) => {
    sessionStorage.clear();
    history.push("/");
  };

  return (
    <div>
      <nav class="w-full z-30 top-0 text-blue-1000 py-1 lg:py-6">
        <div class="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 px-2 py-2 lg:py-6">
          <div class="pl-4 flex items-center">
            <a
              class="hover:no-underline font-bold text-2xl lg:text-4xl flex flex-row items-center"
              href="/"
            >
              <img src="./logo.png" className="w-20 mr-4" />
              <p className="text-5xl text-blue-1000"> WarriorsTogether </p>
            </a>
          </div>
          <div
            class="w-full flex-grow lg:flex lg:items-center lg:w-auto hidden mt-2 lg:mt-0 text-black p-4 lg:p-0 z-20 justify-end"
            id="nav-content"
          >
            <button class="mr-3">
              <a class="inline-block py-2 px-4" href={"/findgroups"}>
                <p className="text-lg text-blue-1000 border border-solid border-blue-1000 rounded-md px-4 py-2 font-bold">
                  Find Groups
                </p>
              </a>
            </button>
            <button class="mr-3" onClick={onClick}>
              <a class="inline-block py-2 px-4">
                <p className="text-lg text-blue-1000 border border-solid border-blue-1000 rounded-md px-4 py-2 font-bold">
                  Log Out
                </p>
              </a>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
