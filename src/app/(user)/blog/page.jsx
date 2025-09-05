"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";


export default function BlogListPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/blogs?status=published"); 
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        console.error("Failed to fetch blog posts.");
      }
    }
    fetchPosts();
  }, []);

  return (
    
    <main className="container mx-auto py-30 px-8">
       

       <section className="relative py-24 px-6 md:px-12 bg-gradient-to-br from-[#f1f8f4] to-white overflow-hidden">
                {/* Leaf SVG Behind Badge */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-10 w-40 h-40 pointer-events-none">
                  <img
                    src="/leaf-green.png"
                    alt="leaf"
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Text Content */}
                <div className="text-center relative z-10">
                  <div className="flex justify-center items-start">
                    <Badge className="bg-[#2E7D32] text-white px-4 py-1.5 rounded-full mb-6 text-sm shadow-sm">
                      EcoTwist Blog
                    </Badge>
      
                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#1B4332] mb-4 leading-tight transition-all duration-300 relative inline-block group">
                      <span className="relative z-10">Insights & Stories</span>
                    </h1>
                  </div>
      
                  <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Dive into sustainability tips, real-world impact, and stories that
                    redefine the way we think about conscious corporate gifting.
                  </p>
                </div>
       </section>

       <nav className="text-sm text-gray-500 mb-6">
        <ol className="list-reset flex">
         <li>
           <Link href="/" className="text-blue-600 hover:underline">
             Home
           </Link>
         </li>
         <li>
           <span className="mx-2">/</span>
          </li>
          <li className="text-gray-800 font-medium">Blog</li>
        </ol>
      </nav>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-4">
                 {posts.map((post) => (
                   <article key={post._id} className="eco-card group cursor-pointer">
                     <div className="relative overflow-hidden rounded-lg mb-4">
                       <img
                         src={post.headerImage}
                         alt={post.title}
                         className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                       />
                       <div className="absolute top-4 left-4">
                         <Badge
                           variant="secondary"
                           className="bg-white/90 text-slate-700"
                         >
                           {post.category}
                         </Badge>
                       </div>
                     </div>
       
                     <div className="p-6">
                       <h3 className="font-heading text-xl font-semibold text-slate-800 mb-3 group-hover:text-forest transition-colors">
                         {post.title}
                       </h3>
                       <p className="text-slate-600 mb-4 leading-relaxed">
                         {post.excerpt}
                       </p>
       
                       <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                         <span>By {post.author}</span>
                         <span>{post.readTime}</span>
                       </div>
       
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-slate-500">{moment(post.date).format("DD MMMM YYYY")}</span>
                         <Link href={`/blog/${post.slug}`}>
                         <Button
                           variant="ghost"
                           className="text-forest hover:text-forest-600 hover:bg-forest-50 p-0 cursor-pointer hover:zoom-in-5"
                         >
                           Read More →
                         </Button>
                         </Link>
                       </div>
                     </div>
                   </article>
                  
                 ))}
               </div>
       
      {/* <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post._id} className="border rounded p-4">
            {post.headerImage && (
              <img
                src={post.headerImage}
                alt={post.title}
                className="w-full h-48 object-cover mb-4 rounded"
              />
            )}
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            {post.excerpt && <p className="mb-4">{post.excerpt}</p>}
            <Link href={`/blog/${post.slug}`}>
              <Button variant="ghost">Read More →</Button>
            </Link>
          </article>
        ))}
      </div> */}
      
      
      <div className="bg-gradient-to-r from-forest/90 to-forest-dark/90 rounded-2xl p-10 sm:p-14 lg:p-20 max-w-4xl mx-auto lg relative overflow-hidden text-black">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold mb-6 drop-shadow-lg">
            Stay Updated with{" "}
            <span className="text-green-800 ">Sustainability Insights</span>
          </h2>

          <p className="text-green-800 max-w-xl mx-auto mb-10  text-base sm:text-xl tracking-wide">
            Join thousands of eco-conscious readers. Get exclusive updates on
            sustainable business, new eco products, and inspiring impact stories
            straight to your inbox.
          </p>

          <form className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 rounded-lg px-5 py-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-green-800 transition shadow-md"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-gradient-to-r from-ochre to-ochre-dark hover:from-ochre-dark hover:to-ochre transition-all duration-300 rounded-lg px-8 py-4 text-green-800 font-semibold shadow-lg"
            >
              Subscribe
              <svg
                className="w-5 h-5 ml-2 -mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </form>
        </div>
    </main>
  );
}
