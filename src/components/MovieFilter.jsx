import { SORT_FIELD_OPTIONS, SORT_LANG_OPTIONS } from "@libs/kkphim";
import {
    useKKCategories,
    useKKCountries,
    useKKYears,
} from "@/hooks/useMovieData";

const toOptions = (items = []) =>
    items.map((item) => ({ value: item.slug, label: item.name }));

const FilterSelect = ({ label, value, options, onChange, allLabel }) => (
    <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">{label}</span>
        <select
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 min-w-0 cursor-pointer rounded-lg border border-white/10 bg-surface-2 px-3 text-sm text-white transition-colors hover:border-white/20 focus:border-primary"
        >
            {allLabel && <option value="">{allLabel}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </label>
);

// values: { category, country, year, sort_lang, sort_field }
// hidden: các bộ lọc bị khóa theo route (vd trang /the-loai/:slug ẩn "category")
const MovieFilter = ({ values = {}, onChange, hidden = [] }) => {
    const { data: categories } = useKKCategories();
    const { data: countries } = useKKCountries();
    const { data: years } = useKKYears();

    const filters = [
        {
            key: "category",
            label: "Thể loại",
            allLabel: "Tất cả",
            options: toOptions(categories),
        },
        {
            key: "country",
            label: "Quốc gia",
            allLabel: "Tất cả",
            options: toOptions(countries),
        },
        {
            key: "year",
            label: "Năm",
            allLabel: "Tất cả",
            options: toOptions(years),
        },
        {
            key: "sort_lang",
            label: "Ngôn ngữ",
            allLabel: "Tất cả",
            options: SORT_LANG_OPTIONS,
        },
        {
            key: "sort_field",
            label: "Sắp xếp",
            options: SORT_FIELD_OPTIONS,
        },
    ].filter((filter) => !hidden.includes(filter.key));

    return (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-surface-top p-3 sm:grid-cols-3 sm:p-4 min-[1025px]:grid-cols-5">
            {filters.map((filter) => (
                <FilterSelect
                    key={filter.key}
                    label={filter.label}
                    allLabel={filter.allLabel}
                    options={filter.options}
                    value={values[filter.key]}
                    onChange={(value) => onChange(filter.key, value)}
                />
            ))}
        </div>
    );
};

export default MovieFilter;
