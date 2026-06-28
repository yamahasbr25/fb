document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    
    // Menghapus angka dan tanda strip di akhir parameter URL
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    if (!cleanQuery) {
        runAGC('');
        return;
    }

    const targetHtml = cleanQuery + '.html';

    // Fetch override untuk mendahulukan file statis (Output Generator Anda)
    fetch(targetHtml)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('File not found');
        })
        .then(htmlData => {
            document.open();
            document.write(htmlData);
            document.close();
        })
        .catch(error => {
            // Jalankan Fallback AGC jika file statis tidak ditemukan (404)
            const keyword = cleanQuery.replace(/-/g, ' ').trim();
            runAGC(keyword);
        });

    // ==========================================
    // FUNGSI UTAMA AGC (Viral Fallback)
    // ==========================================
    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailImageContainer = document.getElementById('detail-image-container');
        const detailBody = document.getElementById('detail-body');
        const relatedPostsContainer = document.getElementById('related-posts-container');
        const shareSection = document.getElementById('share-section');
        
        const displayedKeywords = new Set();
        if (keyword) {
            displayedKeywords.add(keyword.toLowerCase());
        }
        
        function capitalizeEachWord(str) { 
            if (!str) return ''; 
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
        }
        
        // Hook Viral News Berbahasa Inggris
        function generateSeoTitle(baseKeyword) { 
            const hookWords = ['Shocking:', 'Watch:', 'Unbelievable:', 'Viral:', 'Must See:']; 
            const suffixWords = ['Caught on Camera', 'Goes Viral', 'Revealed', 'Leaves Internet Speechless', 'Exposed'];
            const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; 
            const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
            return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`; 
        }

        function processSpintax(text) {
            const spintaxPattern = /{([^{}]+)}/g;
            while (spintaxPattern.test(text)) {
                text = text.replace(spintaxPattern, (match, choices) => {
                    const options = choices.split('|');
                    return options[Math.floor(Math.random() * options.length)];
                });
            }
            return text;
        }

        // Fungsi menyelipkan Ad2 di bawah paragraf pertama
        function injectAd2(htmlLines) {
            let finalHtml = "";
            const ad2Script = `\n<center style="margin: 20px 0;"><script src="https://seribudollarperhari.github.io/banner/ad2.js"><\/script></center>\n`;
            
            htmlLines.forEach((line, index) => {
                finalHtml += `<p>${line}</p>`;
                if (index === 0) {
                    finalHtml += ad2Script; // Disisipkan tepat setelah p pertama
                }
            });
            return finalHtml;
        }

        function fetchDescriptionTemplate(term) {
            fetch('deskripsi.txt')
                .then(response => response.text())
                .then(data => {
                    const templates = data.split('---').map(t => t.trim()).filter(t => t.length > 0);
                    if(templates.length > 0) {
                        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
                        let parsedText = processSpintax(randomTemplate);
                        parsedText = parsedText.replace(/%keyword%/g, `<strong>${capitalizeEachWord(term)}</strong>`);
                        
                        // Konversi ke array paragraf dan jalankan injeksi Ad2
                        const lines = parsedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                        if(detailBody) detailBody.innerHTML = injectAd2(lines);
                    } else {
                        fallbackDescription(term);
                    }
                })
                .catch(() => fallbackDescription(term));
        }

        function fallbackDescription(term) {
            const p1 = processSpintax(`{You won't believe|Prepare to be shocked by} the {latest|newest} {viral story|trending news} about <strong>${capitalizeEachWord(term)}</strong>. {People all over the internet|Netizens everywhere} are {talking about|sharing} this {crazy|unbelievable} {event|moment}.`);
            const p2 = processSpintax(`{Watch the full video|Read the complete story} above to {see what happened|find out the truth}. {Don't forget to share|Make sure to share this} with your {friends|family} before it {gets taken down|is removed}!`);
            
            if(detailBody) {
                const lines = [p1, p2];
                detailBody.innerHTML = injectAd2(lines);
            }
        }

        if (!keyword) { 
            if(detailTitle) detailTitle.textContent = 'Story Not Found'; 
            if(detailBody) detailBody.innerHTML = '<p>Sorry, the viral story could not be found.</p>'; 
            if (relatedPostsContainer) { 
                relatedPostsContainer.closest('.related-posts-section').style.display = 'none'; 
            } 
            return; 
        }

        function setupShareButtons(titleUrl) {
            if(!shareSection) return;
            const shareUrl = encodeURIComponent(window.location.href);
            const shareTitle = encodeURIComponent(titleUrl);
            
            document.getElementById('share-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
            document.getElementById('share-x').href = `https://twitter.com/intent/tweet?url=${shareUrl}`;
            document.getElementById('share-reddit').href = `https://reddit.com/submit?url=${shareUrl}`;
            document.getElementById('share-wa').href = `https://api.whatsapp.com/send?text=${shareTitle}%20-%20${shareUrl}`;
            shareSection.style.display = 'block';
        }

        function populateMainContent(term) {
            const newTitle = generateSeoTitle(term);
            document.title = `${newTitle} | Viral Daily News`;
            if(detailTitle) detailTitle.textContent = newTitle;

            // Gambar Fallback AGC Menggunakan Bing
            const queryImage = term + " news viral";
            const mainImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=800&h=500&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
            if(detailImageContainer) detailImageContainer.innerHTML = `<img src="${mainImageUrl}" alt="${newTitle}" style="width:100%; border-radius:8px;">`;

            fetchDescriptionTemplate(term);
            setupShareButtons(newTitle);
        }

        function appendRandomKeywords() {
            fetch('keyword.txt')
                .then(response => response.text())
                .then(data => {
                    const keywords = data.split('\n')
                        .map(k => k.trim())
                        .filter(k => k.length > 0 && !displayedKeywords.has(k.toLowerCase()));
                    
                    if (keywords.length === 0) return;
                    
                    for (let i = keywords.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [keywords[i], keywords[j]] = [keywords[j], keywords[i]];
                    }
                    
                    const selectedKeywords = keywords.slice(0, 6);
                    
                    selectedKeywords.forEach(relatedTerm => {
                        displayedKeywords.add(relatedTerm.toLowerCase());
                        
                        const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
                        const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                        
                        const queryImage = relatedTerm + " news viral";
                        const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=400&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                        const newRelatedTitle = generateSeoTitle(relatedTerm);
                        
                        const card = `<a href="${linkUrl}" class="content-card"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a>`;
                        if(relatedPostsContainer) relatedPostsContainer.innerHTML += card;
                    });
                })
                .catch(e => console.log('Gagal load keyword.txt:', e));
        }

        // Sugesti diambil menggunakan tambahan query "viral" agar hasil bahasa inggris dan relevan
        function generateRelatedPosts(term) {
            const script = document.createElement('script');
            script.src = `https://suggestqueries.google.com/complete/search?client=youtube&jsonp=handleRelatedSuggest&hl=en&q=${encodeURIComponent(term + " viral")}`;
            document.head.appendChild(script);
            script.onload = () => script.remove();
            script.onerror = () => { 
                if(relatedPostsContainer) relatedPostsContainer.innerHTML = ''; 
                script.remove(); 
                appendRandomKeywords();
            }
        }

        window.handleRelatedSuggest = function(data) {
            const suggestions = data[1];
            if(relatedPostsContainer) relatedPostsContainer.innerHTML = '';
            let relatedCount = 0;
            
            if (suggestions && suggestions.length > 0) {
                suggestions.forEach(item => {
                    const relatedTerm = typeof item === 'string' ? item : item[0];
                    let cleanTerm = relatedTerm ? relatedTerm.replace(/viral|news/gi, '').trim() : '';
                    if (!cleanTerm) cleanTerm = relatedTerm;

                    const termLower = cleanTerm.toLowerCase();
                    if (!termLower || displayedKeywords.has(termLower) || relatedCount >= 6) return;
                    
                    displayedKeywords.add(termLower);
                    relatedCount++;
                    
                    const keywordForUrl = cleanTerm.replace(/\s/g, '-').toLowerCase();
                    const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                    
                    const queryImage = cleanTerm + " news viral";
                    const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=400&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                    const newRelatedTitle = generateSeoTitle(cleanTerm);
                    
                    const card = `<a href="${linkUrl}" class="content-card"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a>`;
                    if(relatedPostsContainer) relatedPostsContainer.innerHTML += card;
                });
            }
            appendRandomKeywords();
        };

        populateMainContent(keyword);
        generateRelatedPosts(keyword);
    }
});
