import React from "react";
import Carousel from "react-bootstrap/Carousel";
import PostCarousel from "./PostCarousel";
import { useGetPostsQuery } from "../../features/posts/postsApiSlice";
import student_adv from "../../image/student_adv.png";
import { Buffer } from "buffer";
import { useState } from "react";

const CarouselBody = () => {
	const [descShow, descSetter] = useState(false);
	const [descPop, descPopSetter] = useState(false);
	const {
		data: posts,
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetPostsQuery();

	let content;

	// if (isLoading) content = <PulseLoader color={"#FFF"}/>
	if (isLoading) content = <p>Loading...</p>;

	if (isError) {
		content = <p className="errmsg">{error?.data?.message}</p>;
	}

	if (isSuccess) {
		console.log({ posts });
		const { ids, entities } = posts;
		const postList = ids?.length
			? ids.map((postId) => (
					<Carousel.Item
						onMouseEnter={() => descSetter(true)}
						onMouseLeave={() => {
							descSetter(false);
							descPopSetter(false);
						}}
					>
						<img
							src={`data:${
								entities[postId].image.contentType
							};base64,${entities[postId].image.data.toString("base64")}`}
							class="d-block w-100 center"
							alt="StudentAdvisory"
						/>
						{descShow && (
							<div
								className="click-for-detail d-flex justify-content-center align-items-center"
								onClick={() => descPopSetter(!descPop)}
							>
								<h3>Click Here For Details!</h3>
							</div>
						)}
						<div className={`carousel-desc ${descPop && "animate-slideUp"}`}>
							<div class="gradient-card align-middle d-flex justify-content-center">
								<div className="gradient">
									<div className="info ms-auto">
										<div className="title text-center">
											{entities[postId].title}
										</div>
										<div className="text fs-3">{entities[postId].text}</div>
									</div>
								</div>
							</div>
						</div>
					</Carousel.Item>
					// <PostCarousel key={postId} postId={postId}></PostCarousel>
			  ))
			: null;

		content = <Carousel interval={null}>{postList}</Carousel>;
	}
	return content;
};

export default CarouselBody;
