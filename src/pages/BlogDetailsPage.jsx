import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { webDB } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const BlogDetailPage = () => {
  const [blog, setBlog] = useState(null);
  const [blogsList, setBlogsList] = useState(() => {
    return JSON.parse(sessionStorage.getItem("blogs")) || [];
  });

  const navigate = useNavigate();
  const { title, id } = useParams();

  useEffect(() => {
    console.log("Selected blog title:", title);

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
        document.title = `${foundBlog.title} - Zymo Blog`;
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
  href={`https://zymo.app/blogs/${encodeURIComponent(blog.title)}/${blog.id}`}
/>

      </Helmet>
      <NavBar />

      <button
        onClick={() => navigate("/blogs")}
        className="mt-4 px-4 py-2 bg-[#faffa4] text-[#212121] rounded"
      >
        Back to Blogs
      </button>

      <div className="container mx-auto px-4 py-8">
        <img
          src={blog.cover}
          alt={blog.title}
          className="w-full h-64 object-cover rounded-lg"
        />
        <h1 className="text-3xl font-bold mt-4 text-white">{blog.title}</h1>
        <p
          className="text-gray-100 mt-2"
          dangerouslySetInnerHTML={{
            __html: htmlParser(blog.description),
          }}
        />
      </div>
      <Footer />
    </>
  );
};

export default BlogDetailPage;
