import React, { useState } from 'react';
import { laws } from '../../data/laws';
import styles from './Reference.module.css';

const Reference = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLaw, setSelectedLaw] = useState(null);

    const filteredLaws = laws.filter(law =>
        law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        law.ref.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLawClick = (law) => {
        setSelectedLaw(law);
    };

    const closeModal = () => {
        setSelectedLaw(null);
    };

    return (
        <div className={styles.referenceContainer}>
            <h2>📖 Нормативно-правовая база</h2>
            <p className={styles.description}>
                В этом разделе собраны все нормативные акты, упомянутые в вопросах. Кликните на документ, чтобы прочитать его полное содержание.
            </p>

            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Поиск по названию или номеру..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <ul className={styles.lawList}>
                {filteredLaws.map(law => (
                    <li key={law.id} className={styles.lawItem} onClick={() => handleLawClick(law)}>
                        <div className={styles.lawTitle}>{law.title}</div>
                        <div className={styles.lawRef}>{law.ref}</div>
                    </li>
                ))}
            </ul>

            {selectedLaw && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={closeModal}>✕</button>
                        <h3>{selectedLaw.title}</h3>
                        <div className={styles.lawRef}>{selectedLaw.ref}</div>
                        <div className={styles.fullText} dangerouslySetInnerHTML={{ __html: selectedLaw.fullText }} />
                        {selectedLaw.url && (
                            <div className={styles.lawLink}>
                                <a href={selectedLaw.url} target="_blank" rel="noopener noreferrer">Открыть полный текст на официальном сайте</a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reference;