document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || user.role !== 'farmer') {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('issue-form');
    const titleInp = document.getElementById('issue-title');
    const descInp = document.getElementById('issue-desc');
    const imageInp = document.getElementById('issue-image');
    const submitBtn = document.getElementById('submit-issue-btn');
    const errorDiv = document.getElementById('issue-error');
    const successDiv = document.getElementById('issue-success');
    const issuesList = document.getElementById('issues-list');

    const loadIssues = async () => {
        if (!issuesList) return;
        try {
            const data = await issueAPI.getMyIssues();
            
            if (data.data.length === 0) {
                issuesList.innerHTML = '<p style="color:#888;">You have not submitted any issues yet.</p>';
                return;
            }

            issuesList.innerHTML = data.data.map(issue => `
                <div class="issue-card">
                    ${issue.imageUrl ? `<img src="${issue.imageUrl}" class="issue-img" alt="Issue image">` : '<div class="issue-img" style="display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#ccc;"><i class="fa-solid fa-image fa-3x"></i></div>'}
                    <div class="issue-content">
                        <span class="status-badge status-${issue.status}">${issue.status}</span>
                        <h4 style="margin-bottom:10px; font-size:1.2rem;">${issue.title}</h4>
                        <p style="color:#555; margin-bottom:10px;">${issue.description}</p>
                        <small style="color:#888;">Submitted: ${new Date(issue.createdAt).toLocaleDateString('en-IN')}</small>
                        
                        ${issue.adminResponse ? `
                            <div class="admin-reply">
                                <strong><i class="fa-solid fa-user-doctor text-primary"></i> Expert Response:</strong>
                                <p style="margin-top:5px;">${issue.adminResponse}</p>
                                ${issue.suggestedProducts && issue.suggestedProducts.length > 0 ? `
                                    <div style="margin-top:10px; border-top:1px dashed #ccc; padding-top:10px;">
                                        <strong>Suggested Products:</strong>
                                        <ul style="margin-top:5px; padding-left:20px; color:var(--primary-dark);">
                                            ${issue.suggestedProducts.map(p => `<li>${p.name} (₹${p.sellingPrice})</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');

        } catch (err) {
            issuesList.innerHTML = `<p style="color:red;">Failed to load issues: ${err.message}</p>`;
        }
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';

            try {
                let imageUrl = '';
                
                // Upload image if selected
                if (imageInp.files.length > 0) {
                    const uploadRes = await uploadAPI.uploadImage(imageInp.files[0]);
                    imageUrl = uploadRes.url;
                }

                await issueAPI.create({
                    title: titleInp.value,
                    description: descInp.value,
                    imageUrl
                });

                successDiv.style.display = 'block';
                form.reset();
                loadIssues(); // Refresh list
            } catch (err) {
                errorDiv.textContent = err.message || 'Failed to submit issue';
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Issue';
                setTimeout(() => { successDiv.style.display = 'none'; }, 5000);
            }
        });
    }

    loadIssues();
});
