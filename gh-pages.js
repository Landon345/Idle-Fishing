import ghpages from "gh-pages";

ghpages.publish(
  "dist", // path to build output directory
  {
    branch: "gh-pages",
    repo: "https://github.com/Landon345/Idle-Fishing", // Update to point to your repository
    user: {
      name: "Landon345", // update to use your name
      email: "lschlangen5@gmail.com", // Update to use your email
    },
  },
  () => {
    console.log("Deploy Complete!");
  }
);
