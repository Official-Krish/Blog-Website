import { Cirlce } from "./BlogCard"

export const BlogSkeleton = () => {
    return <div role="status" className="animate-none bg-blue">
        <div className="p-4 border-b border-slate-200 pb-4 w-screen max-w-screen-md cursor-pointer bg-blue">
            <div className="flex">
                <div className="h-6 w-4 bg-blue rounded-full mb-4"></div>
                <div className="h-4 bg-blue rounded-full mb-5"></div>
                <div className="h-4 bg-blue rounded-full mb-5"></div>
                <div className="flex justify-center flex-col pl-2">
                    <Cirlce />
                </div>
                <div className="pl-2 font-thin text-slate-500 text-sm flex justify-center flex-col">
                    <div className="h-4 bg-blue rounded-full mb-5"></div>
                </div>
            </div>
            <div className="text-xl font-semibold pt-2">
                <div className="h-4 bg-blue rounded-full mb-5"></div>
            </div>
            <div className="text-md font-thin">
                <div className="h-4 bg-blue rounded-full mb-5"></div>
            </div>
            <div className="text-slate-500 text-sm font-thin pt-4">
                <div className="h-4 bg-blue rounded-full mb-5"></div>
            </div>
        </div>
    <span className="sr-only">Loading...</span>
</div>
}