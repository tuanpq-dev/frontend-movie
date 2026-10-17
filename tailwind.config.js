/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            // Bảng màu tham khảo RoPhim
            colors: {
                surface: {
                    DEFAULT: "#191B24", // nền trang
                    top: "#202331", // nền banner/drawer
                    2: "#282B3A", // card, dropdown, panel
                    3: "#2F3346", // hover, skeleton
                    4: "#3E435C",
                    5: "#535D8E",
                    footer: "#0F111A",
                },
                primary: {
                    DEFAULT: "#FFD875",
                    hover: "#FFDE8A",
                    ink: "#191B24", // chữ trên nền primary/trắng
                },
                accent: "#1667CF", // badge lồng tiếng/tập (xanh RoPhim)
                muted: "#AAAAAA",
                line: "rgb(255 255 255 / 0.06)",
            },
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
            },
            height: {
                custom: "calc(100vh - 88px)",
            },
            width: {
                "content-inner": "min(400px, 100%)",
            },
            gridTemplateColumns: {
                footer: "2fr 1fr 1fr 1fr",
            },
        },
    },
    plugins: [],
};
