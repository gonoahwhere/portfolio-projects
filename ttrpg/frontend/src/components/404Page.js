/* ===== IMPORTS ===== */
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

/* ===== STYLES ===== */
import '../styles/404Page.css'

/* ===== DISPLAY ===== */
function ErrorPage() {
    return (
        <>
            <Helmet>
                <title>404 • gonoahwhere</title>
            </Helmet>
            <div className='page-404'>
                <div className='content-wrapper'>
                    <div className='error-item error-number'>
                        <span>4</span>
                        <div className='error-orb'></div>
                        <span>4</span>
                    </div>
                    
                    <h1 className='error-item error-title'>LOST IN SPACE</h1>
                    
                    <p className='error-item error-message'>
                        Looks like this page wandered off into the cosmic void...
                    </p>
                    <div className='error-item sparkle-line'></div>
                    <Link to='/' className='error-item home-button' style={{ letterSpacing: '2px' }}>
                        ✦ Return Home ✦
                    </Link>
                </div>
                {/* Decorative floating elements */}
                <div className='floaty' style={{ '--delay': '0s', '--duration': '6s' }}>✦</div>
                <div className='floaty' style={{ '--delay': '0.5s', '--duration': '7s' }}>◆</div>
                <div className='floaty' style={{ '--delay': '1s', '--duration': '8s' }}>✦</div>
                <div className='floaty' style={{ '--delay': '1.5s', '--duration': '6.5s' }}>◆</div>
                <div className='floaty' style={{ '--delay': '2s', '--duration': '7.5s' }}>✦</div>
            </div>
        </>
    )
}
export default ErrorPage;