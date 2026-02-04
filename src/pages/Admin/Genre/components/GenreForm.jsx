import PropTypes from "prop-types";
import FormInput from "src/@crema/core/Form/FormInput";
import FormTextArea from "src/@crema/core/Form/FormTextArea";

const GenreForm = ({ readOnly = false }) => {
    return (
        <>
            <FormInput
                label="Tên thể loại"
                name="nameGenre"
                placeholder="Nhập tên thể loại"
                required={!readOnly}
                disabled={readOnly}
            />

            <FormTextArea
                label="Mô tả"
                name="desc"
                placeholder="Nhập mô tả thể loại"
                rows={4}
                disabled={readOnly}
            />
        </>
    );
};

GenreForm.propTypes = {
    readOnly: PropTypes.bool,
};

export default GenreForm;
