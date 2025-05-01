import React from "react";

const BlogCard = ({ blog }) => {
  // Slug for URL
  let urlTitle = blog.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .join("-");

  const averageWordsPerMinute = 200;
  const description = blog.description || "";
  const wordCount = description.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.round(wordCount / averageWordsPerMinute));

  return (
    <div
      className="relative group w-full h-[420px] overflow-hidden shadow-lg shadow-gray-950 hover:shadow-2xl hover:shadow-gray-950 transition-all duration-300 hover:ring-2 hover:ring-[#f9ffa5] rounded-xl"
    >
      <div className="overflow-hidden w-full h-full">
        <img
          src={blog.cover}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-0 bg-black bg-opacity-40 p-8 flex flex-col justify-between text-white">
        <span className="text-xs font-semibold text-black bg-[#faffa4] px-2 py-1 rounded-md w-fit">
          {blog.category} • {readTime} minute{readTime > 1 ? "s" : ""} read
        </span>

        <a
          href={`/blogs/${urlTitle}/${blog.id}`}
          onClick={() => localStorage.setItem("selectedBlogTitle", blog.title)}
          className="group block mt-4"
        >
          <h2 className="relative text-xl md:text-[1.4rem] font-bold leading-snug group-hover:text-[#faffa4]">
            {blog.title}
          </h2>

          <p className="mt-4 text-sm font-medium inline-flex items-center">
            <span className="transition-transform group-hover:translate-x-1 duration-200">
              Read the Blog
            </span>
            <span className="ml-4 transform transition-opacity duration-200 opacity-0 group-hover:opacity-100">
              →
            </span>
          </p>
        </a>
      </div>
    </div>
  );
};

export default BlogCard;
