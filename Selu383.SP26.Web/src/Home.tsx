import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="hero-root">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />

            <div className="hero-content">
                <span className="hero-tag">
                    specialty coffee&nbsp;&nbsp;·&nbsp;&nbsp;hammond, la&nbsp;&nbsp;·&nbsp;&nbsp;new orleans, la&nbsp;&nbsp;·&nbsp;&nbsp;new york, ny
                </span>

                <h1 className="hero-headline">
                    three locations.<br />
                    six drinks.<br />
                    unlimited ways to smile.
                </h1>

                <p className="hero-sub">
                    come say hi today<span className="hero-cat">(@^u^)</span>
                </p>

                <div className="hero-ctas">
                    <Button
                        component={Link}
                        to="/menu"
                        size="lg"
                        color="#a5b4fc"
                        className="font-tiempos-text"
                        tt="lowercase"
                        style={{ letterSpacing: '0.06em', paddingLeft: 32, paddingRight: 32, borderRadius: 12 }}
                    >
                        explore menu
                    </Button>
                    <Button
                        component={Link}
                        to="/rewards"
                        size="lg"
                        variant="subtle"
                        color="#a5b4fc"
                        className="font-tiempos-text"
                        tt="lowercase"
                        style={{ letterSpacing: '0.06em' }}
                    >
                        our rewards
                    </Button>
                </div>
            </div>
        </div>
    );
}
