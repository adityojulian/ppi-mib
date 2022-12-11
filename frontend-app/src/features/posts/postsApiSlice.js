import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const postsAdapter = createEntityAdapter({
	sortComparer: (a, b) =>
		a.completed === b.completed ? 0 : a.completed ? 1 : -1,
});

const initialState = postsAdapter.getInitialState();

export const postsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getPosts: builder.query({
			query: () => "/posts",
			validateStatus: (response, result) => {
				return response.status === 200 && !result.isError;
			},
			keepUnusedDataFor: 5,
			transformResponse: (responseData) => {
				const loadedPosts = responseData.map((post) => {
					post.id = post._id;
					return post;
				});
				return postsAdapter.setAll(initialState, loadedPosts);
			},
			providesTags: (result, error, arg) => {
				if (result?.ids) {
					return [
						{ type: "Post", id: "LIST" },
						...result.ids.map((id) => ({ type: "Post", id })),
					];
				} else return [{ type: "Post", id: "LIST" }];
			},
		}),
		newPost: builder.mutation({
			query: (initialPost) => ({
				url: "/posts",
				method: "POST",
				body: initialPost,
			}),
			invalidatesTags: [{ type: "Post", id: "LIST" }],
		}),
		updatePost: builder.mutation({
			query: (initialPost) => ({
				url: "/posts",
				method: "PATCH",
				body: initialPost,
			}),
			invalidatesTags: (result, error, args) => [{ type: "Post", id: args.id }],
		}),
		deletePost: builder.mutation({
			query: ({ id }) => ({
				url: "/posts",
				method: "DELETE",
				body: { id },
			}),
			invalidatesTags: (result, error, args) => [{ type: "Post", id: args.id }],
		}),
	}),
});

export const {
	useGetPostsQuery,
	useNewPostMutation,
	useUpdatePostMutation,
	useDeletePostMutation,
} = postsApiSlice;

// returns the query result object
export const selectPostsResult = postsApiSlice.endpoints.getPosts.select();

// creates memoized selector
const selectPostsData = createSelector(
	selectPostsResult,
	(postsResult) => postsResult.data // normalized state object with ids & entities
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
	selectAll: selectAllPosts,
	selectById: selectPostById,
	selectIds: selectPostIds,
	// Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(
	(state) => selectPostsData(state) ?? initialState
);
