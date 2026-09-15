/* ===== IMPORTS ===== */
import { Link } from 'react-router-dom';

/* ===== STYLES ===== */
import '../styles/entryPoint.css';

/* ===== DISPLAY ===== */
function Entry() {
    return (
        <>
            <div className='page-404'>
                <div className='content-wrapper'>
                    <h1 className='error-item error-title'>HOW DO YOU WANT TO PROCEED?</h1>

                    <p className='error-item error-message'>
                        Create, Read, Update or Delete an entity...
                    </p>
                    
                    <p className='error-item sparkle-line'></p>

                    <div className='error-item button-group'>
                        <Link to='/create' className='error-item home-button' style={{ letterSpacing: '2px' }}>
                            ✦ CREATE ✦
                        </Link>

                        <Link to='/read' className='error-item home-button' style={{ letterSpacing: '2px' }}>
                            ✦ READ ✦
                        </Link>

                        <Link to='/update' className='error-item home-button' style={{ letterSpacing: '2px' }}>
                            ✦ UPDATE ✦
                        </Link>

                        <Link to='/delete' className='error-item home-button' style={{ letterSpacing: '2px' }}>
                            ✦ DELETE ✦
                        </Link>
                    </div>
                </div>

                <div className='floaty' style={{ '--delay': '0s', '--duration': '6s' }}>✦</div>
                <div className='floaty' style={{ '--delay': '0.5s', '--duration': '7s' }}>◆</div>
                <div className='floaty' style={{ '--delay': '1s', '--duration': '8s' }}>✦</div>
                <div className='floaty' style={{ '--delay': '1.5s', '--duration': '6.5s' }}>◆</div>
                <div className='floaty' style={{ '--delay': '2s', '--duration': '7.5s' }}>✦</div>
            </div>
        </>
    )
}

export default Entry;