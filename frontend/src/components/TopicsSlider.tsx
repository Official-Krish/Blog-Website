import React, { useRef, useEffect, useState } from 'react';
import LeftArrowIcon from './icons/LeftArrowIcon';
import RightArrowIcon from './icons/RightArrowIcon';
import useFetchTopicTags from '../hooks/useFetchTopicTags';
import { useNavigate } from 'react-router-dom';

interface topicProps {
  selectedTopic: string;
  setSelectedTopic: React.Dispatch<React.SetStateAction<string>>;
}

const TopicsSlider: React.FC<topicProps> = ({ selectedTopic, setSelectedTopic }: topicProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { tagOptions, loading } = useFetchTopicTags();

  const navigate = useNavigate();

  const [atStart, setAtStart] = useState(true);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 100, behavior: 'smooth' });
      setAtStart(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -100, behavior: 'smooth' });
      // Check if we are back at the start
      if (scrollContainerRef.current.scrollLeft <= 100) {
        setAtStart(true);
      }
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setAtStart(scrollContainerRef.current.scrollLeft === 0);
    }
  };

  const handleTopicClick = (value: string) => {
    setSelectedTopic(value);
    navigate(`/blogs?tag=${value}`);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="relative flex justify-center items-center w-4/5 mx-auto pt-5 pb-5 no-scrollbar ">
        {atStart ? (
            <div className="demo absolute -left-5 z-10 p-1 cursor-pointer">{/* <AddTopicIcon /> */}</div>
        ) : (
            <button onClick={scrollLeft} className="demo absolute -left-5 z-10 bg-sub border-main p-1">
            <LeftArrowIcon />
            </button>
        )}
        <div className="flex overflow-x-auto scrollbar-hide no-scrollbar space-x-4 p-2" ref={scrollContainerRef}>
            {loading ? (
            <div>Loading...</div>
            ) : (
            tagOptions.map((topic) => (
                <div
                key={topic.value}
                onClick={() => handleTopicClick(topic.value)}
                className={`flex-shrink-0 cursor-pointer px-3 py-2 text-sm transition-colors duration-200 ${
                    selectedTopic === topic.value
                    ? 'text-black dark:text-gray-300 font-bold underline underline-offset-8 decoration-black dark:decoration-gray-300'
                    : 'text-sub hover:text-main'
                }`}
                >
                {topic.text}
                </div>
            ))
            )}
        </div>
        <button onClick={scrollRight} className="absolute -right-5 z-10 bg-sub border-main p-1">
            <RightArrowIcon />
        </button>
    </div>
  );
};

export default TopicsSlider;