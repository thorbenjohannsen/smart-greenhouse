type Props = {
    text?: string;
};

function ComingSoon({
                        text = "Bald verfügbar",
                    }: Props) {
    return (
        <span className="coming-soon">
      {text}
    </span>
    );
}

export default ComingSoon;