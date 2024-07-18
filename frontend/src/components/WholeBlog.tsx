
import { useState } from "react";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";

import Spinner from "./Spinner";
import { useBlog } from "../hooks";
import { useNavigate, useParams } from "react-router-dom";
import BookmarkIcon from "../components/icons/Bookmark";
import BookmarkSolid from "../components/icons/BookmarkSolid";
import Tooltip from "../components/ToolTip";
import Modal from "../components/Modal";
import "react-quill/dist/quill.bubble.css";
import RemoveIcon from "../components/icons/Remove";
import EditIcon from "../components/icons/Edit";

import ClapIcon from "../components/icons/Clap";
import { Avatar } from "./BlogCard";
import { BlogSkeleton } from "./Blogskeleton";
import { getPlainTextFromHTML } from "../utils/string";
import VoiceOver from "./VoiceOver";
import ChatModule from "./ChatModule";

export const FullBlog = () => {
	const { id } = useParams();
	const { blog, loading } = useBlog({
		id: id || "",
	});
	if (loading){
		return (
			<div className="flex flex-col justify-center items-center p-4 md:px-10 bg-blue">
				<BlogSkeleton/>
			</div>
		)
	};

	return (
		<div className="flex flex-col justify-center items-center p-4 md:px-10 bg-blue">
			<div className="p-4 max-w-[680px]">
				<div className="text-xl md:text-4xl font-extrabold py-4 line-clamp-4 text-gray-300">{blog?.title}</div>
				<AuthorBox name={blog?.author?.name} details={blog?.author?.details} />
				<ActionBox />
				<div className="pt-4 pb-4">
					<VoiceOver content={getPlainTextFromHTML(blog?.content)} />
				</div>
				<object data={`https://picsum.photos/300/300?random`} type="image/jpeg" className="w-full h-3/5 rounded-lg px-28">
					<div className="bg-gray-50 w-[100%] animate-pulse aspect-square"></div>
				</object>
				<div className="py-4 text-slate-300">
					<ReactQuill value={blog?.content} readOnly={true} theme={"bubble"} />
				</div>
				<ChatModule />
			</div>
		</div>
	);
};

const Loader = () => (
	<div className="w-screen h-screen flex justify-center items-center">
		<Spinner />
	</div>
);

const ActionBox = () => {
	const navigate = useNavigate();
	const [openUnbookmarkModal, setOpenUnbookmarkModal] = useState(false);

	const { id } = useParams();
	const {
		blog,
		loading,
		deleteBlog,
		bookmarkBlog,
		unbookmarkBlog,
		submittingBookmark,
		submittingClap,
		likeBlog,
	} = useBlog({
		id: id || "",
	});
	if (loading) <Loader />;
	const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
	const isAuthor = user?.id === blog?.author?.id;

	const deleteStory = async () => {
		if (id) {
			const message = await deleteBlog(id);
			toast.info(message);
			navigate("/blogs");
		}
	};

	const bookmarkPost = () => {
		bookmarkBlog();
	};

	const unbookmarkPost = () => {
		setOpenUnbookmarkModal(true);
	};

	const onConfirmUnbookmark = () => {
		unbookmarkBlog(blog.bookmarkId!);
		setOpenUnbookmarkModal(false);
	};

	const beginEditStory = () => {
		navigate(`/edit/${blog.id}`);
	};

	const determineBookmarkView = () => {
		if (submittingBookmark) {
			return <Spinner />;
		}
		if (!blog.bookmarkId) {
			return (
				<Tooltip message="Save">
					<BookmarkIcon onClickIcon={bookmarkPost} className="w-10 h-10 p-2 cursor-pointer" />
				</Tooltip>
			);
		}
		return (
			<Tooltip message="Unsave">
				<BookmarkSolid onClickIcon={unbookmarkPost} className="w-10 h-10 p-2 cursor-pointer" />
			</Tooltip>
		);
	};

	const likeStory = () => {
		//if (blog?.claps?.length < 10) {
			likeBlog();
		//}
	};
	return (
		<div className="text-lg font-light text-slate-500 py-4 items-center justify-between flex border-y">
			Post on {blog?.publishedDate}
			<div className="flex justify-center items-center">
				{submittingClap ? (
					<Spinner className="p-0 m-0 w-4 h-4" />
				) : (
					<Tooltip message="Clap">
						<button
							onClick={likeStory}
							type="button"
							name="like-story"
							className="focus:outline-none font-medium rounded-lg text-sm px-4 flex gap-2 justify-center items-center"
						>
							<ClapIcon /> {blog?.claps?.length || ""}
						</button>
					</Tooltip>
				)}
				{determineBookmarkView()}
				{isAuthor && (
					<>
						<Tooltip message="Edit">
							<button
								onClick={beginEditStory}
								type="button"
								name="edit-story"
								className="focus:outline-none font-medium rounded-lg text-sm px-4"
							>
								<EditIcon />
							</button>
						</Tooltip>
						<Tooltip message="Remove">
							<button
								onClick={deleteStory}
								type="button"
								name="delete-story"
								className="focus:outline-none font-medium rounded-lg text-sm px-2"
							>
								<RemoveIcon />
							</button>
						</Tooltip>
					</>
				)}
			</div>
			<Modal
				message={"Are you sure that you want to unbookmark this post?"}
				openModal={openUnbookmarkModal}
				onConfirm={onConfirmUnbookmark}
				onCloseModal={() => setOpenUnbookmarkModal(false)}
			/>


		</div>
	);
};

const AuthorBox = ({ name, details }: { name: any, details: string | undefined }) => (
	<div className="p-4">
		<div className="flex items-center gap-4 py-4">
			<Avatar name={name || "Anonymous"} />
			<div>
				<div className="font-bold text-slate-100">{name || "Anonymous"}</div>
				<div>{details}</div>
			</div>
		</div>
	</div>
);

