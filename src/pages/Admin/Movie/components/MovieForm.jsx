import { Form, Button, Row, Col, Select } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import FormInput from "src/@crema/core/Form/FormInput";
import FormSelect from "src/@crema/core/Form/FormSelect";
import FormTextArea from "src/@crema/core/Form/FormTextArea";
import FormInputNumber from "src/@crema/core/Form/FormInputNumber";
import { API_URL } from "@libs/config";

// Cấu hình field chung
const FIELD_CONFIGS = {
    basicInfo: [
        {
            name: "originName",
            label: "Tên phim gốc",
            component: FormInput,
            placeholder: "Nhập tên phim gốc",
            required: true,
            col: { xs: 24, md: 24 },
        },
    ],
    secondaryInfo: [
        {
            name: "slug",
            label: "Slug",
            component: FormInput,
            placeholder: "Nhập slug",
            col: { xs: 24, md: 12 },
        },
        {
            name: "director",
            label: "Đạo diễn",
            component: FormInput,
            placeholder: "Nhập tên đạo diễn",
            col: { xs: 24, md: 12 },
        },
    ],
    productionInfo: [
        {
            name: "time",
            label: "Thời lượng",
            component: FormInput,
            placeholder: "VD: 120 phút",
            col: { xs: 24, md: 8 },
        },
        {
            name: "year",
            label: "Năm sản xuất",
            component: FormInputNumber,
            placeholder: "Năm",
            min: 1900,
            max: 2030,
            required: true,
            col: { xs: 24, md: 8 },
        },
        {
            name: "type",
            label: "Loại phim",
            component: FormSelect,
            options: [
                { value: "single", label: "Phim lẻ" },
                { value: "series", label: "Phim bộ" },
            ],
            col: { xs: 24, md: 8 },
        },
    ],
    castInfo: [
        {
            name: "actor",
            label: "Diễn viên",
            component: FormInput,
            placeholder: "Nhập danh sách diễn viên",
            col: { xs: 24, md: 12 },
        },
    ],
};

// Component hiển thị ảnh
const ImageField = ({ label, src, alt, className }) => (
    <Form.Item label={label}>
        <div className="flex justify-center">
            <img src={src} alt={alt} className={className} />
        </div>
    </Form.Item>
);

ImageField.propTypes = {
    label: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
};

// Component upload ảnh
const ImageUpload = ({ label, id, preview, onChange }) => (
    <div className="mb-4">
        <label className="mb-1 block font-bold">{label}</label>
        <input
            type="file"
            id={id}
            accept="image/*"
            hidden
            onChange={onChange}
        />
        <label htmlFor={id} className="cursor-pointer">
            <img
                src={preview}
                alt={`${label} preview`}
                className="h-32 w-32 rounded-xl border border-gray-300 object-cover transition-colors hover:border-blue-500"
            />
        </label>
    </div>
);

ImageUpload.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    preview: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

// Component render fields động
const FieldRow = ({ fields, readOnly }) => (
    <Row gutter={[16, 0]}>
        {fields.map((field) => {
            const Component = field.component;
            const commonProps = {
                label: field.label,
                name: field.name,
                disabled: readOnly,
            };

            const editProps = readOnly
                ? {}
                : {
                      placeholder: field.placeholder,
                      required: field.required,
                      min: field.min,
                      max: field.max,
                      options: field.options,
                      mode: field.mode,
                  };

            return (
                <Col key={field.name} {...field.col}>
                    <Component {...commonProps} {...editProps} />
                </Col>
            );
        })}
    </Row>
);

FieldRow.propTypes = {
    fields: PropTypes.array.isRequired,
    readOnly: PropTypes.bool,
};

// Component hiển thị episodes cho mode view
const EpisodesList = ({ episodes }) => {
    if (!episodes?.length) {
        return <p className="text-gray-500">Chưa có tập phim nào</p>;
    }

    return (
        <div className="max-h-60 overflow-y-auto rounded border p-2">
            {episodes.map((ep, index) => (
                <div
                    key={index}
                    className="mb-2 rounded border-b p-2 last:mb-0 last:border-b-0"
                >
                    <p className="font-medium">Tập {ep.name || index + 1}</p>
                    <p className="truncate text-sm text-gray-500">
                        {ep.link || ep.video || "Chưa có link"}
                    </p>
                </div>
            ))}
        </div>
    );
};

EpisodesList.propTypes = {
    episodes: PropTypes.array,
};

const MovieForm = ({
    readOnly = false,
    genresList = [],
    posterPreview,
    thumbPreview,
    onChangePoster,
    onChangeThumb,
    viewingMovie,
}) => {
    const getImageUrl = (url) => {
        if (!url) return "/img-placeholder.jpg";
        return url.startsWith("http") ? url : `${API_URL}/images/movies/${url}`;
    };

    // Mode xem chi tiết
    if (readOnly && viewingMovie) {
        return (
            <>
                <FieldRow fields={FIELD_CONFIGS.basicInfo} readOnly />
                <FieldRow fields={FIELD_CONFIGS.secondaryInfo} readOnly />
                <FieldRow fields={FIELD_CONFIGS.productionInfo} readOnly />

                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <FormSelect
                            label="Thể loại"
                            name="genres"
                            mode="multiple"
                            disabled
                            options={genresList.map((g) => ({
                                value: g._id,
                                label: g.nameGenre,
                            }))}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <FieldRow fields={FIELD_CONFIGS.castInfo} readOnly />
                    </Col>
                </Row>

                <FormTextArea label="Mô tả" name="content" rows={4} disabled />

                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <ImageField
                            label="Poster"
                            src={getImageUrl(viewingMovie?.posterUrl)}
                            alt="Poster"
                            className="h-40 w-28 rounded object-cover"
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <ImageField
                            label="Thumbnail"
                            src={getImageUrl(viewingMovie?.thumbUrl)}
                            alt="Thumbnail"
                            className="h-28 w-40 rounded object-cover"
                        />
                    </Col>
                </Row>

                <Form.Item label="Danh sách tập phim">
                    <EpisodesList episodes={viewingMovie?.episodes} />
                </Form.Item>
            </>
        );
    }

    // Mode thêm mới / chỉnh sửa
    return (
        <>
            <FieldRow fields={FIELD_CONFIGS.basicInfo} />

            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <FormInput
                        label="Slug"
                        name="slug"
                        placeholder="Nhập slug"
                    />
                </Col>
                <Col xs={12} md={6}>
                    <FormInputNumber
                        label="Năm sản xuất"
                        name="year"
                        placeholder="Năm"
                        min={1900}
                        max={2030}
                        required
                    />
                </Col>
                <Col xs={12} md={6}>
                    <FormInput
                        label="Thời lượng"
                        name="time"
                        placeholder="VD: 120 phút"
                    />
                </Col>
            </Row>

            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <FormInput
                        label="Đạo diễn"
                        name="director"
                        placeholder="Nhập tên đạo diễn"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <FormInput
                        label="Diễn viên"
                        name="actor"
                        placeholder="Nhập danh sách diễn viên"
                    />
                </Col>
            </Row>

            <FormTextArea
                label="Nội dung"
                name="content"
                placeholder="Nhập nội dung phim"
                rows={4}
            />

            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <ImageUpload
                        label="Chọn ảnh Poster"
                        id="poster-img-modal"
                        preview={posterPreview}
                        onChange={onChangePoster}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <ImageUpload
                        label="Chọn ảnh Thumbnail"
                        id="thumb-img-modal"
                        preview={thumbPreview}
                        onChange={onChangeThumb}
                    />
                </Col>
            </Row>

            <FormInput
                label="Trailer Key"
                name="trailerKey"
                placeholder="Nhập trailer key (VD: xG2zhTMEQCo)"
            />

            <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Loại phim" name="type">
                        <Select placeholder="Chọn loại phim">
                            <Select.Option value="single">
                                Phim lẻ
                            </Select.Option>
                            <Select.Option value="series">
                                Phim bộ
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={16}>
                    <Form.Item
                        label="Thể loại"
                        name="genres"
                        getValueFromEvent={(value) => value}
                        getValueProps={(value) => ({
                            value: value?.map((g) => g._id || g) || [],
                        })}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn thể loại phim"
                            optionFilterProp="children"
                            style={{ width: "100%" }}
                        >
                            {genresList.map((genre) => (
                                <Select.Option
                                    key={genre._id}
                                    value={genre._id}
                                >
                                    {genre.nameGenre}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            {/* Episodes Section */}
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                }
            >
                {({ getFieldValue }) => {
                    const movieType = getFieldValue("type");

                    if (movieType === "single") {
                        return (
                            <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                <h3 className="mb-4 text-lg font-bold">
                                    Video phim
                                </h3>
                                <FormInput
                                    label="URL Video"
                                    name={["episodes", 0, "video"]}
                                    placeholder="Nhập URL video phim"
                                />
                                <Form.Item
                                    hidden
                                    name={["episodes", 0, "name"]}
                                    initialValue="Full"
                                >
                                    <input />
                                </Form.Item>
                            </div>
                        );
                    }

                    return (
                        <div className="mt-4 rounded-lg border border-gray-200 p-4">
                            <h3 className="mb-4 text-lg font-bold">
                                Danh sách tập phim
                            </h3>
                            <Form.List name="episodes">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(
                                            ({ key, name, ...restField }) => (
                                                <div
                                                    key={key}
                                                    className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
                                                >
                                                    <Row
                                                        gutter={[16, 0]}
                                                        align="middle"
                                                    >
                                                        <Col xs={24} md={11}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[
                                                                    name,
                                                                    "name",
                                                                ]}
                                                                label={`Tên tập ${name + 1}`}
                                                            >
                                                                <input
                                                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                                                    placeholder="Nhập tên tập phim"
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={11}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[
                                                                    name,
                                                                    "video",
                                                                ]}
                                                                label={`Video tập ${name + 1}`}
                                                            >
                                                                <input
                                                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                                                    placeholder="Nhập URL video"
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col
                                                            xs={24}
                                                            md={2}
                                                            className="flex items-center justify-center"
                                                        >
                                                            {fields.length >
                                                                1 && (
                                                                <MinusCircleOutlined
                                                                    onClick={() =>
                                                                        remove(
                                                                            name,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-xl text-red-500 hover:text-red-700"
                                                                />
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ),
                                        )}
                                        <Form.Item>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm tập phim
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </div>
                    );
                }}
            </Form.Item>
        </>
    );
};

MovieForm.propTypes = {
    readOnly: PropTypes.bool,
    genresList: PropTypes.array,
    posterPreview: PropTypes.string,
    thumbPreview: PropTypes.string,
    onChangePoster: PropTypes.func,
    onChangeThumb: PropTypes.func,
    viewingMovie: PropTypes.object,
};

export default MovieForm;
