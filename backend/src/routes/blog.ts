import { createPostInput, updatePostInput } from "@krishanand/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { generateArticle } from "../genAI";
import { buildPostSearchQuery, buildTagSearchQuery, buildUserSearchQuery } from "../query";
import { getDBInstance } from "../db/db";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
		OPENAI_API_KEY: string;
    },
    Variables: {
        userId: string
    }
}>();



blogRouter.get("/search", async (c) => {
	try {
		const keyword = c.req.query("keyword") || "";
		const prisma = getDBInstance(c);
		const postQuery = buildPostSearchQuery(keyword);
		const userQuery = buildUserSearchQuery(keyword);
		const tagQuery = buildTagSearchQuery(keyword);
		const [posts, users, tags] = await Promise.all([
			prisma.post.findMany(postQuery),
			prisma.user.findMany(userQuery),
			prisma.tag.findMany(tagQuery),
	  	]);
		return c.json({
			posts: posts,
			users: users,
			tags: tags,
		});
	} catch (e) {
		c.status(411);
		return c.json({
			message: "Error while fetching post",
			error: e,
		});
	}
});
  

blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    const user = await verify (authHeader, c.env.JWT_SECRET)
    if (!user) {
        c.status(403);
        return c.json({
            message: "Unauthorized"
        })
    }
    c.set("userId", user.id)
    await next()
})

blogRouter.post('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = createPostInput.safeParse(body);
    if (!success){
      c.status (411);
      return c.json({
        msg : "inputs are not correct"
      })
    }
	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	return c.json({
		id: post.id
	});
})

blogRouter.put('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = updatePostInput.safeParse(body);
    if (!success){
      c.status (411);
      return c.json({
        msg : "inputs are not correct"
      })
    }
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});


blogRouter.get("/bulk", async(c)=>{
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	try{
		const blogs = await prisma.post.findMany({
			select : {
				id : true,
				title : true,
				content :  true,
				author : {
					select : {
						name : true
					}
				}
			}
		});
		return c.json({
			blogs
		})
	}catch(e){
		console.log(e);
		c.status(403);
		c.json({
			msg : "Some issues while connecting to db"
		})
	}
	
})


blogRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findUnique({
		where: {
			id
		},select : {
			title : true,
			content : true,
			author : {
				select : {
					name : true
				}
			}
		}
	});

	return c.json(post);
})

blogRouter.post("/generate", async (c) => {
	try {
		if (!c.env.OPENAI_API_KEY) {
			return c.json({
				title: "",
				article: "This feature is disabled.",
			});
		}
		const body = await c.req.json();
		const title = body.title;
		const response = await generateArticle(title, "gpt", c.env.OPENAI_API_KEY);
		return c.json({
			title: title,
			article: response,
		});
	} catch (ex) {
		c.status(403);
		return c.json({ error: "Something went wrong" });
	}
});

blogRouter.get("/bulkUser/:id", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	try {
	  const userId = c.req.param("id");
	  const posts = await prisma.post.findMany({
		where: {
		  authorId: userId,
		},
		select: {
		  content: true,
		  title: true,
		  id: true,
		  author: {
			select: {
			  name: true,
			},
		  },
		  published: true,
		  tagsOnPost: {
			select: {
			  tag: {
				select: {
				  id: true,
				  tagName: true,
				}
			  }
			}
		  }
		},
	  });
	  return c.json({
		posts: posts,
	  });
	} catch (e) {
	  console.log(e);
	  c.status(411);
	  return c.json({
		message: "Error while fetching post",
	  });
	}
  });

