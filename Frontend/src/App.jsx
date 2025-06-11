import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import { motion } from "framer-motion";
import { FiCopy, FiDownload, FiSun, FiMoon } from "react-icons/fi";
import "./App.css";

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Handle theme and highlighting
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    const timeout = setTimeout(() => prism.highlightAll(), 0);
    return () => clearTimeout(timeout);
  }, [theme, review]);

  // Toggle dark/light
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
  };

  // Send code for review
  async function reviewCode() {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/ai/get-review", {
        code,
      });

      if (
        !response ||
        typeof response.data !== "string" ||
        response.data.trim() === ""
      ) {
        console.error("Unexpected review format:", response?.data);
        setReview("⚠️ No review received or response was empty.");
      } else {
        setReview(response.data);
      }
    } catch (error) {
      console.error("Review failed:", error);
      setReview("⚠️ Error reviewing code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Copy to clipboard
  function copyReview() {
    if (!review) return;
    navigator.clipboard.writeText(review);
    alert("✅ Review copied to clipboard!");
  }

  // Download review
  function downloadReview() {
    if (!review) return;
    const element = document.createElement("a");
    const file = new Blob([review], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "review.txt";
    document.body.appendChild(element);
    element.click();
  }

  const Spinner = () => <div className="glow-spinner" />;

  return (
    <>
      <motion.h1
        className="animated-header"
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ✨ AI Code Reviewer
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
      </motion.h1>

      <main className="fancy-background">
        <motion.div
          className="left glass"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="code-area">
            <div className="code scrollable-code">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={(code) =>
                  prism.highlight(
                    code,
                    prism.languages.javascript,
                    "javascript"
                  )
                }
                padding={10}
                style={{
                  fontFamily: '"Fira Code", monospace',
                  fontSize: 16,
                  minHeight: "100%",
                  overflowX: "hidden",
                }}
              />
            </div>
            <div className="review-button" onClick={reviewCode}>
              {loading ? <Spinner /> : "Review"}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="right glass"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="review-controls">
            <FiCopy onClick={copyReview} className="icon" title="Copy" />
            <FiDownload
              onClick={downloadReview}
              className="icon"
              title="Download"
            />
          </div>
          <div className="markdown-body">
            {review ? (
              <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
            ) : (
              !loading && (
                <p style={{ opacity: 0.5 }}>
                  No review yet. Click "Review" to begin.
                </p>
              )
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}

export default App;
