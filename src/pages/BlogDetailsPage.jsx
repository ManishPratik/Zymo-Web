import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import { ArrowUp } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { webDB } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const BlogDetailPage = () => {
  const [blog, setBlog] = useState(null);
  const [canonicalTitle, setCanonicalTitle] = useState(null);

  const [blogsList, setBlogsList] = useState(() => {
    return JSON.parse(sessionStorage.getItem("blogs")) || [];
  });

  const navigate = useNavigate();
  const { title, id } = useParams();

  useEffect(() => {

    const fetchBlogs = async () => {
      try {
        const blogsCollection = collection(webDB, "blogs");
        const blogsSnapshot = await getDocs(blogsCollection);
        const blogsData = blogsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBlogsList(blogsData);
        sessionStorage.setItem("blogs", JSON.stringify(blogsData));

        return blogsData;
      } catch (error) {
        console.error("Error fetching blogs:", error);
        return [];
      }
    };

    const findBlog = async () => {
      let blogs = blogsList.length ? blogsList : await fetchBlogs();
      const foundBlog = blogs.find((b) => b.id === id);

      if (!foundBlog) {
        toast.error("Blog not found", {
          position: "top-center",
          autoClose: 5000,
        });
        navigate("/blogs", { replace: true });
      } else {
        setBlog(foundBlog);

        // Full title for canonical URL
        const fullCanonicalTitle = foundBlog.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .split(/\s+/)
          .slice(0,7)
          .join("-");
        setCanonicalTitle(fullCanonicalTitle);

        document.title = `${foundBlog.title.length > 60
          ? foundBlog.title.slice(0, 57) + "..."
          : foundBlog.title} - Zymo Blog`;

      }
    };

    findBlog();
  }, [id, blogsList, navigate, title]);

  if (!blog) return null;

  const htmlParser = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    return doc.body.innerHTML;
  };

  const averageWordsPerMinute = 200;
  const description = blog.description || "";
  const wordCount = description.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.round(wordCount / averageWordsPerMinute));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>
          {blog ? `${blog.title} - Zymo Blog` : "Blog Details - Zymo"}
        </title>
        <meta
          name="description"
          content={blog.description.substring(0, 150) + "..."}
        />
        <meta property="og:title" content={`${blog.title} - Zymo Blog`} />
        <meta property="og:description" content={blog.description} />
        <link
          rel="canonical"
          href={`https://zymo.app/blogs/${canonicalTitle}/${blog.id}`}
        />


      </Helmet>
      <NavBar />
      {console.log("canonicalTitle",canonicalTitle)}
      <button
        onClick={() => navigate("/blogs")}
        className="pl-6 text-white md:sticky top-10"
      >
        <ArrowLeft />
      </button>

      <div className="container mx-auto md:px-14 xl:px-6 px-6 py-8 max-w-[80rem] md:mb-20 mb-0">
        <div className="flex md:flex-row flex-col gap-10 justify-between">

          {/* Left column */}
          <div className="md:w-1/3 h-fit md:sticky top-20">
            <h1 className="lg:text-5xl md:text-4xl text-3xl font-bold text-white md:text-left text-center break-words">{blog.title}</h1>
            <div className="flex flex-row flex-wrap items-center gap-2 mt-5 justify-center md:justify-start">
              <span className="bg-darkGrey2 md:px-3 md:text-base text-sm px-2 py-1 rounded-lg text-white">{blog.category}</span>
              <span className="bg-darkGrey2 md:px-3 md:text-base text-sm px-2 py-1 rounded-lg text-white">{readTime} min{readTime > 1 ? "s" : ""} read</span>
              {/* <span className="bg-darkGrey2 md:px-3 md:text-base text-sm px-2 py-1 rounded-lg text-white">Mar 12, 2024</span> */}
            </div> 
          </div>

          {/* Right column */}
          <div className="md:w-2/3">
            <div>
              <img 
                src={blog.cover}
                alt={blog.title}
                className="rounded-2xl w-full"
              />
            </div>
            <p
              className="text-white mt-10 md:mb-[-9rem] mb-0"
              dangerouslySetInnerHTML={{
                __html: htmlParser(blog.description),
              }}
            />
          </div>
          
        </div>
        <div className="sticky bottom-20 mt-10 w-fit hidden sm:block">
          <button
          onClick={scrollToTop}
          className="bg-darkGrey2 p-3 rounded-xl text-white"
        >
          <ArrowUp size={20} />
        </button>
              
        </div>

      </div>
      <Footer />
    </>
  );
};

export default BlogDetailPage;
