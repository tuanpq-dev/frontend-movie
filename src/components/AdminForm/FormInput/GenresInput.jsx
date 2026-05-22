import { useMemo } from "react";
import { useGenres } from "@/hooks/useMovieData";

const GenresInput = ({ onChange, value = [] }) => {
    const { data = [] } = useGenres();
    const genres = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    return (
        <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
                const selected = value?.includes(genre._id);

                return (
                    <button
                        key={genre._id}
                        type="button"
                        className={`min-h-11 rounded-md border px-3 py-1 transition-colors ${
                            selected ? "bg-black text-white" : ""
                        }`}
                        onClick={() => {
                            const currentValue = selected
                                ? value.filter((g) => g !== genre._id)
                                : [...value, genre._id];
                            onChange(currentValue);
                        }}
                    >
                        {genre.nameGenre}
                    </button>
                );
            })}
        </div>
    );
};

export default GenresInput;
