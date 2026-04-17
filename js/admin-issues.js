document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || user.role === 'farmer') {
        window.location.href = '../index.html';
        return;
    }

    const issuesList = document.getElementById('admin-issues-list');

    const loadIssues = async () => {
        try {
            const data = await issueAPI.getAll();
            
            if (data.data.length === 0) {
                issuesList.innerHTML = '<p style="color:#888;">No crop issues submitted yet.</p>';
                return;
            }

            issuesList.innerHTML = data.data.map(issue => `
                <div class="issue-card-admin">
                    ${issue.imageUrl ? `<img src="${issue.imageUrl}" class="issue-img" alt="Crop Image">` : '<div style="width:150px;height:150px;background:#eee;display:flex;align-items:center;justify-content:center;">No Image</div>'}
                    <div class="issue-details">
                        <div style="display:flex; justify-content:space-between;">
                            <div>
                                <span class="status-badge status-${issue.status}">${issue.status}</span>
                                <h4 style="margin-bottom:5px;">${issue.title}</h4>
                                <p style="color:#666; font-size:0.9rem;">By: <strong>${issue.farmer ? issue.farmer.name : 'Unknown'}</strong> | Mobile: ${issue.farmer ? issue.farmer.mobile : 'N/A'}</p>
                            </div>
                            <span style="color:#999; font-size:0.8rem;">${new Date(issue.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        
                        <p style="margin-top:10px; background:#f9f9f9; padding:10px; border-radius:5px;">${issue.description}</p>
                        
                        ${issue.status === 'Pending' ? `
                            <div class="response-box" id="response-box-${issue._id}">
                                <h5 style="margin-bottom:5px;">Write Response</h5>
                                <textarea id="reply-${issue._id}" class="form-control" rows="3" placeholder="Provide your expert guidance here..."></textarea>
                                <button class="btn btn-primary" onclick="submitResponse('${issue._id}')">Submit Response</button>
                            </div>
                        ` : `
                            <div class="response-box" style="background:#e8f5e9; padding:15px; border-radius:5px; border-left:4px solid var(--success-color);">
                                <h5><i class="fa-solid fa-check-circle"></i> Your Response:</h5>
                                <p style="margin-top:5px;">${issue.adminResponse}</p>
                            </div>
                        `}
                    </div>
                </div>
            `).join('');

        } catch (err) {
            issuesList.innerHTML = `<p style="color:red;">Error loading issues: ${err.message}</p>`;
        }
    };

    window.submitResponse = async (id) => {
        const replyText = document.getElementById(`reply-${id}`).value;
        if (!replyText) return alert('Response cannot be empty');

        try {
            await issueAPI.respond(id, {
                adminResponse: replyText,
                status: 'Responded'
            });
            alert('Response submitted successfully');
            loadIssues();
        } catch (err) {
            alert(err.message || 'Failed to submit response');
        }
    };

    loadIssues();
});
