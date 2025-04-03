;; Outcome Tracking Contract
;; Monitors academic progress of recipients

(define-data-var admin principal tx-sender)
(define-map academic-records
  { student-id: principal, semester: uint }
  {
    gpa: uint,
    attendance: uint,
    recorded-by: principal,
    timestamp: uint
  }
)

;; Read-only functions
(define-read-only (get-academic-record (student-id principal) (semester uint))
  (map-get? academic-records { student-id: student-id, semester: semester })
)

(define-read-only (get-current-semester)
  (/ block-height u1008)
)

;; Public functions
(define-public (record-academic-progress (student-id principal) (gpa uint) (attendance uint))
  (let ((semester (get-current-semester)))
    (begin
      (asserts! (is-eq tx-sender (var-get admin)) (err u403))
      (asserts! (<= gpa u400) (err u400)) ;; GPA max 4.0 (stored as 400)
      (asserts! (<= attendance u100) (err u400)) ;; Attendance max 100%
      (map-set academic-records
        { student-id: student-id, semester: semester }
        {
          gpa: gpa,
          attendance: attendance,
          recorded-by: tx-sender,
          timestamp: block-height
        }
      )
      (ok true)
    )
  )
)

(define-public (add-academic-recorder (new-recorder principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (var-set admin new-recorder)
    (ok true)
  )
)

