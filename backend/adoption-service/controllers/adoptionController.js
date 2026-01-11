const supabase = require('../supabaseClient');

// Helper function to find or create adopter dimension
async function getOrCreateAdopter(adopterData) {
  const { adopter_id, age_group, location, previous_pet_owner } = adopterData;

  const { data: existing, error: findError } = await supabase
    .from('dim_adopter')
    .select('*')
    .eq('adopter_id', adopter_id)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: newAdopter, error: createError } = await supabase
    .from('dim_adopter')
    .insert([{
      adopter_id,
      age_group,
      location,
      previous_pet_owner
    }])
    .select()
    .single();

  if (createError) throw createError;
  return newAdopter;
}

// Helper function to find or create date dimension
async function getOrCreateDate(dateString) {
  const date = new Date(dateString);
  const dateOnly = date.toISOString().split('T')[0];

  const { data: existing, error: findError } = await supabase
    .from('dim_date')
    .select('*')
    .eq('date', dateOnly)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const dayOfWeek = date.getDay();
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const quarter = Math.floor(date.getMonth() / 3) + 1;

  const { data: newDate, error: createError } = await supabase
    .from('dim_date')
    .insert([{
      date: dateOnly,
      day: date.getDate(),
      month: date.getMonth() + 1,
      quarter,
      year: date.getFullYear(),
      day_of_week: dayOfWeek,
      month_name: monthName
    }])
    .select()
    .single();

  if (createError) throw createError;
  return newDate;
}

// FUNCTION 1: Submit adoption application
exports.submitApplication = async (req, res) => {
  try {
    const {
      pet_id,
      adopter_name,
      adopter_email,
      adopter_phone,
      adopter_address,
      housing_type,
      has_yard,
      has_other_pets,
      other_pets_description,
      experience_with_pets,
      reason_for_adoption,
      adopter_age_group,
      adopter_location,
      previous_pet_owner,
      adoption_fee,
      application_date
    } = req.body;

    console.log('Submit application request:', req.body);

    // Get pet dimension ID
    const { data: pet, error: petError } = await supabase
      .from('dim_pet')
      .select('pet_dim_id')
      .eq('pet_id', pet_id)
      .single();

    if (petError) throw petError;

    // Check if pet already has a pending or approved adoption
    const { data: existingAdoption } = await supabase
      .from('fact_adoptions')
      .select('fact_id, status')
      .eq('pet_dim_id', pet.pet_dim_id)
      .in('status', ['Pending', 'Approved'])
      .maybeSingle();

    if (existingAdoption) {
      return res.status(400).json({ 
        error: 'This pet already has a pending or approved adoption application' 
      });
    }

    // Create or get adopter
    const adopter = await getOrCreateAdopter({
      adopter_id: adopter_email, // Use email as adopter_id
      age_group: adopter_age_group || 'Unknown',
      location: adopter_location || 'Unknown',
      previous_pet_owner: previous_pet_owner || false
    });

    // Create or get date record
    const dateRecord = await getOrCreateDate(application_date || new Date().toISOString());

    // Insert adoption application with status='Pending'
    const { data, error } = await supabase
      .from('fact_adoptions')
      .insert([{
        date_id: dateRecord.date_id,
        pet_dim_id: pet.pet_dim_id,
        adopter_dim_id: adopter.adopter_dim_id,
        adoption_fee: adoption_fee || 0,
        processing_time_days: 0,
        qr_scan_count: 0,
        status: 'Pending',
        // Store application details
        adopter_name,
        adopter_email,
        adopter_phone,
        adopter_address,
        housing_type,
        has_yard: has_yard || false,
        has_other_pets: has_other_pets || false,
        other_pets_description,
        experience_with_pets,
        reason_for_adoption,
        application_date: dateRecord.date,
        reviewed_at: null,
        notes: ''
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      ...data,
      message: 'Adoption application submitted successfully and is pending review'
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: error.message });
  }
};

// FUNCTION 2: Get all adoption applications (for admin)
exports.getAllApplications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        *,
        dim_pet (
          pet_id, 
          pet_name:name, 
          species, 
          breed, 
          age_years,
          age_months,
          size, 
          gender,
          photo_url,
          status
        ),
        dim_adopter (adopter_id, age_group, location, previous_pet_owner),
        dim_date (date, month_name, year)
      `)
      .order('date_id', { ascending: false });

    if (error) throw error;

    const formattedData = data.map(adoption => ({
      fact_id: adoption.fact_id,
      adoption_id: adoption.fact_id,
      application_date: adoption.application_date || adoption.dim_date.date,
      status: adoption.status || 'Pending',
      
      // Pet info - nested structure for compatibility
      dim_pet: {
        pet_id: adoption.dim_pet.pet_id,
        pet_name: adoption.dim_pet.pet_name,
        species: adoption.dim_pet.species,
        breed: adoption.dim_pet.breed,
        age_years: adoption.dim_pet.age_years,
        age_months: adoption.dim_pet.age_months,
        size: adoption.dim_pet.size,
        gender: adoption.dim_pet.gender,
        photo_url: adoption.dim_pet.photo_url,
        status: adoption.dim_pet.status
      },
      
      // Adopter info
      adopter_name: adoption.adopter_name,
      adopter_email: adoption.adopter_email || adoption.dim_adopter.adopter_id,
      adopter_phone: adoption.adopter_phone,
      adopter_address: adoption.adopter_address,
      
      // Application details
      housing_type: adoption.housing_type,
      has_yard: adoption.has_yard,
      has_other_pets: adoption.has_other_pets,
      other_pets_description: adoption.other_pets_description,
      experience_with_pets: adoption.experience_with_pets,
      reason_for_adoption: adoption.reason_for_adoption,
      
      // Admin fields
      reviewed_at: adoption.reviewed_at,
      notes: adoption.notes,
      adoption_fee: adoption.adoption_fee,
      processing_time_days: adoption.processing_time_days,
      qr_scan_count: adoption.qr_scan_count
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({ error: error.message });
  }
};

// FUNCTION 3: Get user's adoption applications
exports.getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params; // This is the user's email

    // Find adopter by email
    const { data: adopter } = await supabase
      .from('dim_adopter')
      .select('adopter_dim_id')
      .eq('adopter_id', userId)
      .maybeSingle();

    if (!adopter) {
      return res.json([]);
    }

    // Get all applications for this adopter with FULL pet details
    const { data, error } = await supabase
      .from('fact_adoptions')
      .select(`
        fact_id,
        status,
        application_date,
        reviewed_at,
        notes,
        adopter_name,
        adopter_email,
        adopter_phone,
        adopter_address,
        housing_type,
        has_yard,
        has_other_pets,
        other_pets_description,
        experience_with_pets,
        reason_for_adoption,
        adoption_fee,
        processing_time_days,
        pet_dim_id
      `)
      .eq('adopter_dim_id', adopter.adopter_dim_id)
      .order('fact_id', { ascending: false });

    if (error) throw error;

    // Now fetch pet details for each application
    const applicationsWithPets = await Promise.all(
      data.map(async (adoption) => {
        const { data: petData } = await supabase
          .from('dim_pet')
          .select('*')
          .eq('pet_dim_id', adoption.pet_dim_id)
          .single();

        return {
          fact_id: adoption.fact_id,
          adoption_id: adoption.fact_id,
          application_date: adoption.application_date,
          status: adoption.status,
          
          // Pet info - NESTED STRUCTURE to match frontend expectations
          dim_pet: {
            pet_id: petData?.pet_id || null,
            pet_name: petData?.name || 'Unknown Pet',
            species: petData?.species || '',
            breed: petData?.breed || '',
            age_years: petData?.age_years || 0,
            age_months: petData?.age_months || 0,
            size: petData?.size || '',
            gender: petData?.gender || '',
            color: petData?.color || '',
            photo_url: petData?.photo_url || 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo',
            status: petData?.status || 'Available'
          },
          
          // Application details
          adopter_name: adoption.adopter_name,
          adopter_email: adoption.adopter_email,
          adopter_phone: adoption.adopter_phone,
          adopter_address: adoption.adopter_address,
          housing_type: adoption.housing_type,
          has_yard: adoption.has_yard,
          has_other_pets: adoption.has_other_pets,
          other_pets_description: adoption.other_pets_description,
          experience_with_pets: adoption.experience_with_pets,
          reason_for_adoption: adoption.reason_for_adoption,
          
          // Review info
          reviewed_at: adoption.reviewed_at,
          notes: adoption.notes,
          adoption_fee: adoption.adoption_fee,
          processing_time_days: adoption.processing_time_days
        };
      })
    );

    res.json(applicationsWithPets);
  } catch (error) {
    console.error('Error getting user applications:', error);
    res.status(500).json({ error: error.message });
  }
};

// FUNCTION 4: Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    console.log('Updating application:', { id, status, notes });

    // Validate status
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status: ${status}. Use 'Pending', 'Approved', or 'Rejected'` 
      });
    }

    // If rejecting, update status instead of deleting (for record keeping)
    if (status === 'Rejected') {
      const { data, error } = await supabase
        .from('fact_adoptions')
        .update({
          status: 'Rejected',
          reviewed_at: new Date().toISOString(),
          notes: notes || 'Application rejected'
        })
        .eq('fact_id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({ 
        ...data,
        message: 'Application rejected successfully'
      });
    }

    // If approving, update status and set reviewed_at
    if (status === 'Approved') {
      // First, get the pet_dim_id to update pet status
      const { data: adoption, error: fetchError } = await supabase
        .from('fact_adoptions')
        .select('pet_dim_id')
        .eq('fact_id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update adoption status
      const { data, error } = await supabase
        .from('fact_adoptions')
        .update({
          status: 'Approved',
          reviewed_at: new Date().toISOString(),
          notes: notes || 'Application approved'
        })
        .eq('fact_id', id)
        .select()
        .single();

      if (error) throw error;

      // Update pet status to 'Adopted'
      const { error: petUpdateError } = await supabase
        .from('dim_pet')
        .update({ status: 'Adopted' })
        .eq('pet_dim_id', adoption.pet_dim_id);

      if (petUpdateError) {
        console.error('Error updating pet status:', petUpdateError);
        // Don't throw - adoption was successful even if pet update failed
      }

      res.json({
        ...data,
        message: 'Application approved successfully'
      });
    } else {
      // If setting back to Pending
      const { data, error } = await supabase
        .from('fact_adoptions')
        .update({
          status: 'Pending',
          notes: notes || ''
        })
        .eq('fact_id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        ...data,
        message: 'Application status updated to Pending'
      });
    }
  } catch (error) {
    console.error('Error updating adoption:', error);
    res.status(500).json({ error: error.message });
  }
};