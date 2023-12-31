import React from "react";
import dayjs from "dayjs";
import axios from "axios";
import { useEffect } from "react";
import history from "../Navigation/history";

export default function GroupPost(props) {
  const style = {
    width: "45%",
    minHeight: "200px",
    minWidth: "300px",
    boxShadow: "rgba(236, 236, 236, 0.44) 0px 0px 15px",
    border: "1px solid #f8f4ef",
    background: "#fff",
  };

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

  const date_time = new Date(props.creationDate * 1000);
  const d = date_time.toLocaleDateString();
  const [likedPost, setLikedPost] = React.useState(false);
  const [numLikes, setNumLikes] = React.useState(0);
  const [isAuthor, setIsAuthor] = React.useState(false);
  const [displayModal, setDisplayModal] = React.useState(false);
  const [displayConfirmation, setDisplayConfirmation] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const postID = props.postID;
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    let authToken = sessionStorage.getItem("Auth Token");
    if (!authToken) {
      history.push("/login");
    }

    //Call api to get the number of likes on this post
    getPostLikes();

    //Call api to check if the user liked the post or not
    checkIfLiked();

    //Call api to see if the user is the author os the post
    checkIfAuthor();
  }, [props.posts]);

  const handleLike = () => {
    setLikedPost(!likedPost);

    //unliking a post
    if (likedPost) {
      setNumLikes(numLikes - 1);
      //Call api to delete the like from the database
      axios.post("/api/deleteLike", { postID: postID, username: username });
    } else {
      //liking a post
      setNumLikes(numLikes + 1);
      //Call api to add a like to the database
      axios.post("/api/addLike", { postID: postID, username: username });
    }
  };

  const deletePost = () => {
    setDisplayModal(false);
    //Api call to delete the post
    axios.post("/api/deleteAllPostLikes", { postID: postID }).then((res) => {
      axios
        .post("/api/deletePost", { postID: postID, username: username })
        .then((res) => {
          //show success message
          props.getPosts();
          setDeleted(true);
        });
    });
  };

  const getPostLikes = () => {
    axios.post("/api/getPostLikes", { postID: postID }).then((res) => {
      // console.log("likes:", res.data);
      setNumLikes(res.data.length);
    });
  };

  const checkIfLiked = () => {
    axios
      .post("/api/checkIfLiked", { postID: postID, username: username })
      .then((res) => {
        // console.log("if liked:", res.data[0]["COUNT(1)"]);
        const ifLiked = res.data[0]["COUNT(1)"];
        if (ifLiked) {
          setLikedPost(true);
          console.log("post", props.title, "is liked");
        } else {
          setLikedPost(false);
        }
      });
  };

  const checkIfAuthor = () => {
    axios
      .post("/api/checkIfAuthor", { postID: postID, username: username })
      .then((res) => {
        const ifAuthor = res.data[0]["COUNT(1)"];
        if (ifAuthor) {
          setIsAuthor(true);
          console.log("is author of post", postID);
        } else {
          setIsAuthor(false);
        }
      });
  };

  return (
    <div className="mt-4 mr-5">
      <div
        class="w-full bg-white border border-gray-200 rounded-lg shadow flex flex-col"
        style={{ width: "40vw" }}
      >
        {props.imageUrl ? (
          <img src={props.imageUrl} className="rounded-t-lg p-8 w-fit h-96 self-center justify-self-center" />
        ) : (
          <div className="pt-8"></div>
        )}
        <div class="px-5 pb-5">
          <h5 class="text-2xl font-medium tracking-tight text-gray-900">
            {props.title}
          </h5>
          <p className="text-sm mt-1">
            posted by{" "}
            <span className="font-medium text-base">{props.username}</span> on{" "}
            <span className="font-medium text-base">{d}</span>
          </p>
          <p className="mt-5">{props.description}</p>

          <div className=" flex flex-wrap justify-between mt-5 align-bottom">
            <div>
              {!likedPost ? (
                <img
                  src="./heart-empty(1).svg"
                  alt="like buton"
                  onClick={() => handleLike()}
                  className="cursor-pointer inline"
                  id={`likePost${postID}`}
                />
              ) : (
                <img
                  src="./heart-full.svg"
                  alt="like buton"
                  onClick={() => handleLike()}
                  className="cursor-pointer inline"
                  id={`unlikePost${postID}`}
                />
              )}
              <span className="ml-1 pt-1 align-middle ">{numLikes}</span>
            </div>
            {isAuthor && !deleted && (
              <button
                className="underline text-sm mt-auto"
                onClick={() => setDisplayModal(true)}
              >
                delete
              </button>
            )}
          </div>
        </div>
      </div>
      {displayModal && (
        <div
          className="h-screen w-screen fixed top-0 left-0 overflow-hidden"
          style={{ backgroundColor: "rgb(66, 66, 66, 0.4)" }}
        >
          <div id="modal" style={modalStyle}>
            <h2 className="text-2xl font-medium mb-5">Are you sure?</h2>
            <p className="mb-10">
              Are you sure you want to delete this post?{" "}
              <span className="font-medium">This action cannot be undone.</span>
            </p>
            <div className="flex flex-wrap justify-between">
              <button
                onClick={() => {
                  deletePost();
                  setDisplayConfirmation(true);
                }}
                className="text-white px-4 py-1 bg-red-700 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => setDisplayModal(false)}
                className="underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {displayConfirmation && (
        <div
          className="h-screen w-screen fixed top-0 left-0 overflow-hidden"
          style={{ backgroundColor: "rgb(66, 66, 66, 0.4)" }}
        >
          <div id="modal" style={modalStyle}>
            <h2 className="text-2xl font-medium mb-5">Success</h2>
            <p className="mb-10">The post was successfully deleted.</p>

            <button
              onClick={() => setDisplayConfirmation(false)}
              className="underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
