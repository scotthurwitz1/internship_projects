 describe('agent info unit test', () => {
        // change
        it('should set valid values for agentInfo and agentId using a dependent part of the response', (done) => {
            const trackingID = 'YOUR_TRACKING_ID';
            // parsed xml of case
            let metaDataPath = path.join(__dirname, '../data/ExpressTerm.xml');
            let sampleXML = fs.readFileSync(metaDataPath);

            // stubs it, calls fake, pushes sample xml to callback
            const applicationAdminServiceStub = sinon.stub(applicationAdminService, 
                'getSubmissionFromRawDataByTrackingID').callsFake((trackingIDs, callback) => {
                callback(null, sampleXML)
            });

            const req = {
                params: {
                    trackingID,
                }
            };
            const res = {
                status: (statusCode) => res,
                json: (agentInfoObj) => {
                    expect(agentInfoObj).to.have.property('agentFirstName', 'Martin');
                    applicationAdminServiceStub.restore();
                    done();
                },
                setHeader: () => res,
            };

            applicationController.getAgentInfoByTrackingID(req, res, () => {});
            
        });
    });

    ~~~~~~~~~~~~~~~~~

    describe('Unit Test for documentURL array', () => {
        afterEach(() => {
            sinon.restore();
        });
        
        it('should populate documentURL array correctly', (done) => {
        const req = {
            body: {
            PolicyNumber: 'Policy123',
            Documents: [
                { DocumentNumber: 'Doc1', checkSum: '123', DocumentName: 'Document1' },
                { DocumentNumber: 'Doc2', checkSum: '456', DocumentName: 'Document2' },
            ],
            },
            };
        const res = {
            status: sinon.stub().returnsThis(),
            end: sinon.stub(),
            setHeader: sinon.stub(),
        };
        const next = sinon.stub();
        
        // Mock the applicationService.getCaseIdFromPolicy function
        const mockCaseId = 'Case123';
        const applicationServiceStub = sinon.stub(applicationService, 'getCaseIdFromPolicyNumber');
        applicationServiceStub.callsFake((policy, callback) => {
            callback(null, mockCaseId);
        });
        
        // Call the getURLsFor function from the mainModule
        applicationController.getURLsForDocument(req, res, next);
        
        // Expectations
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.end.calledOnce).to.be.true;
        expect(res.setHeader.calledWith('Content-Type', 'application/json')).to.be.true;
        expect(next.notCalled).to.be.true;
        
        const expectedDocumentURLs = [
            {
                AbsoluteURL: "http://testURL.com/applications/Case123/documents/Doc1?checksum=123",
                DocumentName: "Document1"
            },
            {
                AbsoluteURL: "http://testURL.com/applications/Case123/documents/Doc2?checksum=456",
                DocumentName: "Document2"
            },
        ];
        const responseJSON = JSON.parse(res.end.args[0][0]);
        expect(responseJSON.PolicyNumber).to.equal('Policy123');
        expect(responseJSON.Documents).to.deep.equal(expectedDocumentURLs);
        
        done();
        });
    });