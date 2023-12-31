import React from "react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import history from "../Navigation/history";

export let groupID = -1;
export let groupContent = {};

function FindGroupCard(props) {
  const [inGroup, setInGroup] = React.useState(false);
  const username = sessionStorage.getItem("username");
  const [displayConfirmation, setDisplayConfirmation] = React.useState(false);
  const [areYouSure, setAreYouSure] = React.useState(false);
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "30%",
    background: "#f4f4f4",
    padding: "30px",
    borderRadius: "5px",
    // boxShadow: "0px 0px 15px #787878",
  };

  useEffect(() => {
    let authToken = sessionStorage.getItem("Auth Token");
    if (!authToken) {
      history.push("/login");
    }

    setInGroup(props.joined);
  }, []);

  const joinGroup = () => {
    axios
      .post("/api/joinGroup", { username: username, groupID: props.groupID })
      .then((res) => {
        if (res.data.message === "success") {
          setInGroup(true);
          setDisplayConfirmation(true);
          const { groups, group, setGroups } = props;
          const groupsCopy = [];
          group.members = group.members + 1;
          for (let i = 0; i < groups.length; ++i) {
            if (groups[i].groupID != group.groupID) {
              groupsCopy.push(groups[i]);
            } else {
              groupsCopy.push(group);
            }
          }

          setGroups(groupsCopy);
        }
      });
  };

  const leaveGroup = () => {
    axios
      .post("/api/leaveGroup", { username: username, groupID: props.groupID })
      .then((res) => {
        if (res.data.message === "success") {
          setInGroup(false);
          const { groups, group, setGroups } = props;
          const groupsCopy = [];
          group.members = group.members - 1;
          for (let i = 0; i < groups.length; ++i) {
            if (groups[i].groupID != group.groupID) {
              groupsCopy.push(groups[i]);
            } else {
              groupsCopy.push(group);
            }
          }

          setGroups(groupsCopy);
        }
      });
  };

  return (
    <div
      className="flex flex-col w-1/4 mr-10 my-4 cursor-pointer rounded-lg overflow-hidden"
      style={
        {
          // boxShadow: "rgba(236, 236, 236, 0.44) 0px 0px 15px",
          // border: "1px solid ${}",
          // background: "#fff",
        }
      }
    >
      <div className="p-5 pb-6" style={{ background: `${props.color}90` }}>
        <h2 className="text-xl font-medium">{props.title}</h2>
        <p className="mt-1">
          {`${props.members || 0} members`} | {props.categories}
        </p>
      </div>
      <div
        className="p-5 pt-5 h-full flex flex-col space-between rounded-b-lg"
        style={{ border: `3px solid ${props.color}90`, borderTop: "none" }}
      >
        <p className="mt-0 mb-6">{props.description}</p>

        {!inGroup && (
          <button
            className="px-4 py-2 bg-amber-300 mt-auto w-40 rounded"
            onClick={() => joinGroup()}
            id={`joinGroup${props.groupID}`}
          >
            Join group
          </button>
        )}
        {inGroup && (
          <button
            className="px-4 py-2 bg-slate-200 mt-auto w-40 rounded"
            onClick={() => setAreYouSure(true)}
            id={`leaveGroup${props.groupID}`}
          >
            Leave group
          </button>
        )}
      </div>
      {displayConfirmation && (
        <div
          className="h-screen w-screen fixed top-0 left-0 overflow-hidden"
          style={{ backgroundColor: "rgb(66, 66, 66, 0.4)" }}
        >
          <div id="modal" style={modalStyle}>
            <h2 className="text-2xl font-medium mb-5">Success</h2>
            <p className="mb-10">You are now a member of {props.title}!</p>

            <button
              onClick={() => setDisplayConfirmation(false)}
              className="underline"
              id="close"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {areYouSure && (
        <div
          className="h-screen w-screen fixed top-0 left-0 overflow-hidden"
          style={{ backgroundColor: "rgb(66, 66, 66, 0.4)" }}
        >
          <div id="modal" style={modalStyle}>
            <h2 className="text-2xl font-medium mb-5">Are you sure?</h2>
            <p className="mb-10">
              Are you sure you want to leave {props.title}? Your posts and
              comments will <span className="font-bold">not</span> be deleted,
              and you can always rejoin later.
            </p>
            <div className="flex flex-wrap justify-between">
              <button
                onClick={() => {
                  setAreYouSure(false);
                  leaveGroup();
                }}
                className="text-white px-4 py-1 bg-red-700 rounded"
                id="leave-group"
              >
                Leave Group
              </button>
              <button
                onClick={() => setAreYouSure(false)}
                className="underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindGroupCard;
