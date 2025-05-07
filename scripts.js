document.addEventListener('DOMContentLoaded', function() {
    // Loading configuration file
    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            // Save config globally for use in other functions
            window.config = config;
            
            // Set page title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = config.title;
            }
            
            // Set header and subtitle
            document.querySelector('h1').textContent = config.title;
            document.querySelector('header p').textContent = config.subtitle;
            
            // Set footer text
            const footerCopyright = document.getElementById('footer-copyright');
            if (footerCopyright) {
                footerCopyright.textContent = config.footer;
            }
            
            // Set "About catalog" text
            const aboutText = document.getElementById('about-text');
            if (aboutText && config.aboutText) {
                aboutText.textContent = config.aboutText;
            }
            
            // Set texts from "texts" section
            if (config.texts) {
                // Set search placeholder
                const searchInput = document.getElementById('search-input');
                if (searchInput && config.texts.search) {
                    searchInput.placeholder = config.texts.search;
                }
                
                // Set tab texts
                if (config.texts.tabs) {
                    document.querySelectorAll('.tab-label').forEach(label => {
                        const tabType = label.getAttribute('data-tab');
                        if (tabType && config.texts.tabs[tabType]) {
                            label.textContent = config.texts.tabs[tabType].toUpperCase();
                        }
                    });
                }
                
                // Set footer texts
                if (config.texts.footer) {
                    // Section headers
                    const aboutTitle = document.getElementById('footer-about-title');
                    if (aboutTitle && config.texts.footer.about) {
                        aboutTitle.textContent = config.texts.footer.about;
                    }
                    
                    const contactsTitle = document.getElementById('footer-contacts-title');
                    if (contactsTitle && config.texts.footer.contacts) {
                        contactsTitle.textContent = config.texts.footer.contacts;
                    }
                    
                    const forumsTitle = document.getElementById('footer-forums-title');
                    if (forumsTitle && config.texts.footer.forums) {
                        forumsTitle.textContent = config.texts.footer.forums;
                    }
                }
            }
            
            // Set contact information
            if (config.contactInfo) {
                updateContactInfo(config.contactInfo);
            }
            
            // Set external links
            if (config.externalLinks) {
                updateExternalLinks(config.externalLinks);
            }
            
            // Set tab names
            const tabLabels = document.querySelectorAll('.tab-label');
            config.categories.forEach((category, index) => {
                if (tabLabels[index]) {
                    tabLabels[index].textContent = category.name;
                }
            });
            
            // Create a map of private channels to their IDs
            const privateChannelMap = {};
            
            // Find the private channels category
            const privateCategory = config.categories.find(cat => cat.id === 'private');
            if (privateCategory) {
                privateCategory.items.forEach((item, index) => {
                    // Use username as key for mapping
                    privateChannelMap[item.username] = `private-card-${index}`;
                });
            }
            
            // Generate cards for each category
            config.categories.forEach((category, index) => {
                const contentId = `content${index + 1}`;
                const contentElement = document.getElementById(contentId);
                
                if (contentElement) {
                    const cardsContainer = contentElement.querySelector('.link-cards');
                    cardsContainer.innerHTML = ''; // Clear container
                    
                    // Add cards
                    category.items.forEach((item, itemIndex) => {
                        // For private channels, add ID for navigation
                        const isPrivate = category.id === 'private';
                        const cardId = isPrivate ? `private-card-${itemIndex}` : `${category.id}-card-${itemIndex}`;
                        
                        const card = createCard(item, category.id === 'channels', privateChannelMap, cardId, config);
                        cardsContainer.appendChild(card);
                    });
                }
            });
            
            // Initialize search
            initSearch(config);
            
            // Initialize "Back to top" button
            initBackToTopButton();
            
            // Handler for switching tabs programmatically
            window.switchToPrivateTab = function(cardId) {
                // Activate private channels tab
                document.getElementById('tab4').checked = true;
                
                // Give time for tab to display
                setTimeout(() => {
                    // Find card and scroll to it
                    const card = document.getElementById(cardId);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Add highlight to card for a short time
                        card.classList.add('highlight-card');
                        setTimeout(() => {
                            card.classList.remove('highlight-card');
                        }, 2000);
                    }
                }, 100);
            };
        })
        .catch(error => console.error('Error loading configuration:', error));
    
    // Function to update contact information
    function updateContactInfo(contactInfo) {
        const contactLabels = document.querySelectorAll('.contact-label');
        const contactValues = document.querySelectorAll('.contact-value');
        
        // Set contact labels from config.texts.footer.contactLabels
        if (window.config && window.config.texts && window.config.texts.footer && window.config.texts.footer.contactLabels) {
            contactLabels.forEach(label => {
                const contactType = label.getAttribute('data-contact-type');
                if (contactType && window.config.texts.footer.contactLabels[contactType]) {
                    label.textContent = window.config.texts.footer.contactLabels[contactType];
                }
            });
        }
        
        // Set contact values
        contactValues.forEach(value => {
            const contactItem = value.closest('.contact-item');
            if (contactItem) {
                const label = contactItem.querySelector('.contact-label');
                if (label) {
                    const contactType = label.getAttribute('data-contact-type');
                    if (contactType && contactInfo[contactType]) {
                        const fullValue = contactInfo[contactType];
                        value.setAttribute('data-full', fullValue);
                        
                        // Shorten long values
                        if (fullValue.length > 20) {
                            value.textContent = fullValue.substring(0, 10) + '...' + fullValue.substring(fullValue.length - 2);
                        } else {
                            value.textContent = fullValue;
                        }
                    }
                }
            }
        });
    }
    
    // Function to update external links
    function updateExternalLinks(externalLinks) {
        const forumsListElement = document.querySelector('.forums-list');
        if (forumsListElement) {
            forumsListElement.innerHTML = '';
            
            externalLinks.forEach(link => {
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.target = '_blank';
                linkElement.innerHTML = `<i class="${link.icon}"></i> ${link.name}`;
                forumsListElement.appendChild(linkElement);
            });
        }
    }
    
    // Function to create a card
    function createCard(item, hasPrivateChannel, privateChannelMap, cardId, config) {
        const card = document.createElement('div');
        card.className = 'card';
        if (cardId) {
            card.id = cardId;
        }
        
        // Add attributes for search
        card.setAttribute('data-title', item.title.toLowerCase());
        card.setAttribute('data-description', item.description.toLowerCase());
        card.setAttribute('data-username', item.username.toLowerCase());
        
        // Create card header with logo
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        const cardLogo = document.createElement('div');
        cardLogo.className = 'card-logo';
        
        // Check if logo exists
        if (item.logo) {
            const logoImg = document.createElement('img');
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            // Use logo path from config
            const logoPath = config.logoPath || 'logo/';
            logoImg.src = `${logoPath}${item.logo}?t=${timestamp}`;
            logoImg.alt = item.title;
            
            // Error handler for image loading
            logoImg.onerror = function() {
                // If image doesn't load, show placeholder
                this.style.display = 'none';
                cardLogo.textContent = item.logoPlaceholder || 'TG';
            };
            
            cardLogo.appendChild(logoImg);
        } else {
            // If logo is not specified, use placeholder
            cardLogo.textContent = item.logoPlaceholder || 'TG';
        }
        
        const title = document.createElement('h3');
        title.textContent = item.title;
        
        cardHeader.appendChild(cardLogo);
        cardHeader.appendChild(title);
        
        // Description
        const description = document.createElement('p');
        description.textContent = item.description;
        
        // Links
        const cardLinks = document.createElement('div');
        cardLinks.className = 'card-links';
        
        // If this is a channel and it has a private channel
        if (hasPrivateChannel && item.privateChannel) {
            const privateBtn = document.createElement('a');
            
            // Check if there is a corresponding card in private channels
            const privateCardId = privateChannelMap[item.privateChannel.username];
            
            if (privateCardId) {
                // If there is a corresponding card, make button to switch to it
                privateBtn.href = "javascript:void(0);";
                privateBtn.onclick = function() {
                    // Add class for button animation on click
                    this.classList.add('btn-clicked');
                    
                    // Remove animation class after transition
                    setTimeout(() => {
                        this.classList.remove('btn-clicked');
                        window.switchToPrivateTab(privateCardId);
                    }, 300);
                };
            } else {
                // Otherwise, just a link to the Telegram channel
                privateBtn.href = item.privateChannel.link;
                privateBtn.target = '_blank';
            }
            
            privateBtn.className = 'private-btn';
            
            // Lock icon
            privateBtn.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
                <span>${config.texts && config.texts.buttons && config.texts.buttons.private ? config.texts.buttons.private : 'Private'}</span>
            `;
            
            // Add private button first
            cardLinks.appendChild(privateBtn);
        }
        
        const mainLink = document.createElement('a');
        mainLink.href = item.link;
        mainLink.textContent = item.username;
        mainLink.target = '_blank';
        mainLink.className = 'main-link';
        
        // Add main link after private button
        cardLinks.appendChild(mainLink);
        
        // Assemble card
        card.appendChild(cardHeader);
        card.appendChild(description);
        card.appendChild(cardLinks);
        
        return card;
    }
    
    // Function to initialize search
    function initSearch(config) {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        if (!searchInput || !searchButton) return;
        
        // Function to perform search
        function performSearch() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            
            if (searchTerm === '') {
                // If search field is empty, show all cards
                document.querySelectorAll('.card').forEach(card => {
                    card.style.display = 'flex';
                });
                
                // Remove search result messages
                document.querySelectorAll('.no-results').forEach(el => el.remove());
                return;
            }
            
            // Counter for found cards in each category
            const foundCount = {
                'content1': 0,
                'content2': 0,
                'content3': 0,
                'content4': 0
            };
            
            // Iterate over all cards and filter them
            document.querySelectorAll('.card').forEach(card => {
                const title = card.getAttribute('data-title') || '';
                const description = card.getAttribute('data-description') || '';
                const username = card.getAttribute('data-username') || '';
                
                const contentId = card.closest('.tab-content').id;
                
                // Check if card contains search query
                if (title.includes(searchTerm) || 
                    description.includes(searchTerm) || 
                    username.includes(searchTerm)) {
                    card.style.display = 'flex';
                    foundCount[contentId]++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Add message if no results in category
            for (const contentId in foundCount) {
                const container = document.getElementById(contentId);
                const existingNoResults = container.querySelector('.no-results');
                
                if (foundCount[contentId] === 0) {
                    if (!existingNoResults) {
                        const noResults = document.createElement('div');
                        noResults.className = 'no-results';
                        noResults.textContent = 'No results found';
                        container.appendChild(noResults);
                    }
                } else if (existingNoResults) {
                    existingNoResults.remove();
                }
            }
        }
        
        // Event handlers for search
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            } else if (e.key === 'Escape') {
                searchInput.value = '';
                performSearch();
            } else if (searchInput.value.trim() === '') {
                performSearch();
            }
        });
    }
    
    // Function to initialize "Back to top" button
    function initBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        
        if (backToTopButton) {
            // Set button text if specified in config
            if (window.config && window.config.texts && window.config.texts.buttons && window.config.texts.buttons.backToTop) {
                backToTopButton.title = window.config.texts.buttons.backToTop;
            }
            
            // Show/hide button on scroll
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            });
            
            // Scroll to top on click
            backToTopButton.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
});
