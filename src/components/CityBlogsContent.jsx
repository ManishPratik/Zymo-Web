import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { webDB } from "../utils/firebase";

const blogsCollection = collection(webDB, "blogs");

const CityBlogsContent = ({ cityName }) => {
    const [blogsList, setBlogsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 4;

    const fetchBlogs = async () => {
        try {
            const data = await getDocs(blogsCollection);
            const allBlogs = data.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title,
                metaDescription: doc.data().metaDescription,
                category: doc.data().category,
                cover: doc.data().cover,
            }));

            try {
                sessionStorage.setItem("allBlogs", JSON.stringify(allBlogs));
            } catch (error) {
                if (error.name === "QuotaExceededError") {
                    console.warn("⚠️ SessionStorage quota exceeded. Skipping cache.");
                } else {
                    console.error("Error saving to sessionStorage:", error);
                }
            }

            return allBlogs;
        } catch (error) {
            console.error("Error fetching blogs:", error);
            return [];
        }
    };

    const filterByCity = (blogs, city) => {
        const searchTerm = city.toLowerCase();

        return blogs.filter((blog) => {
            return (
                blog.title?.toLowerCase().includes(searchTerm) ||
                blog.metaDescription?.toLowerCase().includes(searchTerm) ||
                blog.category?.toLowerCase().includes(searchTerm)
            );
        });

    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadBlogs = async () => {
            setLoading(true);
            let blogs = [];

            if (sessionStorage.getItem("allBlogs")) {
                blogs = JSON.parse(sessionStorage.getItem("allBlogs"));
            } else {
                blogs = await fetchBlogs();
            }

            const filtered = filterByCity(blogs, cityName);
            setBlogsList(filtered);
            setLoading(false);
        };

        loadBlogs();
    }, [cityName]);

    // Pagination logic
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = blogsList.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(blogsList.length / blogsPerPage);


    return (
        <div
            className="bg-[#faffa4] py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 rounded-2xl border border-[#606060] mx-8"
            style={{
                background: "linear-gradient(to right, #212121, #faffa4)",
            }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="ml-2 sm:ml-4 md:ml-8">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-[#faffa4] py-2">
                        Checkout our blogs below!
                    </h2>
                    <p className="text-xs sm:text-sm md:text-lg text-[#faffa4] mb-6 sm:mb-8">
                        Find out what's happening in your city.
                    </p>
                </div>

                <div className="grid gap-6 text-center grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    {loading
                        ? [...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-[#303030] rounded-xl p-4 sm:p-5 md:p-6 shadow-lg animate-pulse mx-2 sm:mx-3"
                            >
                                <div className="w-full h-36 sm:h-40 bg-gray-300 rounded mb-4"></div>
                                <div className="h-5 bg-gray-300 w-3/4 mx-auto rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 w-1/2 mx-auto rounded mb-4"></div>
                                <div className="h-6 bg-gray-400 w-24 mx-auto rounded"></div>
                            </div>
                        ))
                        : currentBlogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="bg-[#404040] text-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 transition-transform duration-300 hover:scale-105 mx-2 sm:mx-3"
                            >
                                <img
                                    src={blog.cover || carSkeleton}
                                    alt="Blog"
                                    className="rounded-lg mb-4 w-full h-40 sm:h-44 md:h-48 lg:h-52 object-cover"
                                />
                                <h3 className="text-base sm:text-lg md:text-xl font-bold">
                                    {blog.title}
                                </h3>
                                <h4 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">
                                    {blog.category}
                                </h4>
                                <p className="mb-4 text-xs sm:text-sm px-1 sm:px-2 md:px-4">
                                    {blog.metaDescription}
                                </p>
                                <a
                                    href={`/blogs/${blog.title
                                        .toLowerCase()
                                        .replace(/[^a-z0-9\s-]/g, "")
                                        .trim()
                                        .split(/\s+/)
                                        .slice(0, 7)
                                        .join("-")}/${blog.id}`}
                                    target="_blank"
                                    className="bg-[#faffa4] text-black px-3 py-2 text-sm rounded-lg hover:bg-[#1e1e1e] hover:text-[#faffa4]"
                                >
                                    View Details
                                </a>
                            </div>
                        ))}
                </div>

                {/* Pagination Controls */}
                {!loading && blogsList.length > blogsPerPage && (
                    <div className="flex flex-wrap justify-center items-center mt-6 gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-white bg-[#303030] rounded-lg hover:bg-[#1e1e1e]"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-[#303030] font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-white bg-[#303030] rounded-lg hover:bg-[#1e1e1e]"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>




    );
};

export default CityBlogsContent;
