const supabase = require('../supabaseClient');

// Get available pets (for public) - pets with status='Available'
exports.getAllPets = async (req, res) => {
  try {
    // Get all pets from dim_pet
    const { data: allPets, error: petsError } = await supabase
      .from('dim_pet')
      .select('*')
      .order('pet_dim_id', { ascending: false });

    if (petsError) throw petsError;

    // Get APPROVED adoptions only
    const { data: adoptions, error: adoptionsError } = await supabase
      .from('fact_adoptions')
      .select('pet_dim_id, status')
      .eq('status', 'Approved');

    if (adoptionsError) throw adoptionsError;

    // Create a Set of adopted pet_dim_ids for fast lookup
    const adoptedPetIds = new Set(adoptions.map(a => a.pet_dim_id));

    // Filter out adopted pets and add status
    const availablePets = allPets
      .filter(pet => !adoptedPetIds.has(pet.pet_dim_id))
      .map(pet => ({
        ...pet,
        status: 'Available'
      }));

    res.json(availablePets);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get ALL pets including adopted (for admin)
exports.getAllPetsForAdmin = async (req, res) => {
  try {
    // Get all pets from dim_pet
    const { data: allPets, error: petsError } = await supabase
      .from('dim_pet')
      .select('*')
      .order('pet_dim_id', { ascending: false });

    if (petsError) throw petsError;

    // Get ALL adoptions (including pending and rejected)
    const { data: adoptions, error: adoptionsError } = await supabase
      .from('fact_adoptions')
      .select(`
        pet_dim_id,
        fact_id,
        status,
        adoption_fee,
        processing_time_days,
        application_date,
        dim_date (
          date,
          month_name,
          year
        )
      `);

    if (adoptionsError) throw adoptionsError;

    // Map adoption data to pets
    const adoptionMap = new Map();
    adoptions.forEach(adoption => {
      const existing = adoptionMap.get(adoption.pet_dim_id);
      if (!existing || adoption.fact_id > existing.fact_id) {
        adoptionMap.set(adoption.pet_dim_id, adoption);
      }
    });

    // Combine data
    const petsWithStatus = allPets.map(pet => {
      const adoption = adoptionMap.get(pet.pet_dim_id);
      
      let status = 'Available';
      if (adoption) {
        if (adoption.status === 'Approved') {
          status = 'Adopted';
        } else if (adoption.status === 'Pending') {
          status = 'Pending';
        } else {
          status = 'Available';
        }
      }

      return {
        ...pet,
        status,
        adoption_date: adoption?.application_date || adoption?.dim_date?.date || null,
        adoption_fee: adoption?.adoption_fee || null,
        processing_time_days: adoption?.processing_time_days || null,
        adoption_status: adoption?.status || null
      };
    });

    res.json(petsWithStatus);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get pet by ID
exports.getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: pet, error: petError } = await supabase
      .from('dim_pet')
      .select('*')
      .eq('pet_id', id)
      .single();

    if (petError) throw petError;

    const { data: adoptions, error: adoptionError } = await supabase
      .from('fact_adoptions')
      .select(`
        *,
        dim_date (
          date,
          month_name,
          year
        ),
        dim_adopter (
          age_group,
          location,
          previous_pet_owner
        )
      `)
      .eq('pet_dim_id', pet.pet_dim_id)
      .order('fact_id', { ascending: false });

    const adoption = adoptions && adoptions.length > 0 ? adoptions[0] : null;

    let status = 'Available';
    if (adoption) {
      if (adoption.status === 'Approved') {
        status = 'Adopted';
      } else if (adoption.status === 'Pending') {
        status = 'Pending';
      }
    }

    const petWithStatus = {
      ...pet,
      status,
      adoption_date: adoption?.application_date || adoption?.dim_date?.date || null,
      adoption_fee: adoption?.adoption_fee || null,
      processing_time_days: adoption?.processing_time_days || null,
      adopter_info: adoption && adoption.status === 'Approved' ? {
        age_group: adoption.dim_adopter?.age_group,
        location: adoption.dim_adopter?.location,
        previous_owner: adoption.dim_adopter?.previous_pet_owner
      } : null
    };

    res.json(petWithStatus);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(404).json({ error: 'Pet not found' });
  }
};

// Create new pet
exports.createPet = async (req, res) => {
  try {
    console.log('=== CREATE PET REQUEST ===');
    console.log('Request body:', req.body);

    const { 
      name,
      species, 
      breed, 
      age_group,
      age_years,
      age_months,
      size, 
      gender,
      photo_url,
      description,
      color,
      weight_kg,
      vaccination_status,
      health_status
    } = req.body;

    if (!species) {
      console.log('ERROR: Species is missing');
      return res.status(400).json({ error: 'Species is required' });
    }

    // Generate unique pet_id as INTEGER
    const pet_id = parseInt(Date.now().toString().slice(-9));
    console.log('Generated pet_id (integer):', pet_id);

    // Calculate age_group
    let calculatedAgeGroup = 'Adult';
    const years = parseInt(age_years) || 0;
    if (years < 1) {
      calculatedAgeGroup = 'Puppy/Kitten';
    } else if (years >= 7) {
      calculatedAgeGroup = 'Senior';
    }

    const insertData = {
      pet_id,
      name: name || `${species} - ${breed || 'Unknown'}`,
      species,
      breed: breed || null,
      age_group: age_group || calculatedAgeGroup,
      age_years: parseInt(age_years) || 0,
      age_months: parseInt(age_months) || 0,
      size: size || null,
      gender: gender || null,
      photo_url: photo_url || null,
      description: description || null,
      color: color || null,
      weight_kg: weight_kg ? parseFloat(weight_kg) : null,
      vaccination_status: vaccination_status || null,
      health_status: health_status || 'Healthy'
    };

    console.log('Data to insert:', insertData);

    const { data, error } = await supabase
      .from('dim_pet')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('=== SUPABASE ERROR ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      return res.status(500).json({ 
        error: error.message,
        details: error.details,
        hint: error.hint 
      });
    }
    
    console.log('=== PET CREATED SUCCESSFULLY ===');
    console.log('Created pet:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update pet
exports.updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      species, 
      breed, 
      age_group,
      age_years,
      age_months,
      size, 
      gender,
      photo_url,
      description,
      color,
      weight_kg,
      vaccination_status,
      health_status
    } = req.body;

    const { data: pet, error: petError } = await supabase
      .from('dim_pet')
      .select('pet_dim_id')
      .eq('pet_id', id)
      .single();

    if (petError) throw petError;

    const { data: adoption, error: adoptionError } = await supabase
      .from('fact_adoptions')
      .select('fact_id, status')
      .eq('pet_dim_id', pet.pet_dim_id)
      .eq('status', 'Approved')
      .maybeSingle();

    if (adoption) {
      return res.status(400).json({ 
        error: 'Cannot edit adopted pet. This pet has been adopted and its information is locked for data integrity.' 
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (species !== undefined) updateData.species = species;
    if (breed !== undefined) updateData.breed = breed;
    if (age_group !== undefined) updateData.age_group = age_group;
    if (age_years !== undefined) updateData.age_years = age_years;
    if (age_months !== undefined) updateData.age_months = age_months;
    if (size !== undefined) updateData.size = size;
    if (gender !== undefined) updateData.gender = gender;
    if (photo_url !== undefined) updateData.photo_url = photo_url;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (weight_kg !== undefined) updateData.weight_kg = weight_kg;
    if (vaccination_status !== undefined) updateData.vaccination_status = vaccination_status;
    if (health_status !== undefined) updateData.health_status = health_status;

    const { data, error } = await supabase
      .from('dim_pet')
      .update(updateData)
      .eq('pet_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete pet
exports.deletePet = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: pet, error: petError } = await supabase
      .from('dim_pet')
      .select('pet_dim_id')
      .eq('pet_id', id)
      .single();

    if (petError) throw petError;

    const { data: adoption, error: adoptionError } = await supabase
      .from('fact_adoptions')
      .select('fact_id, status')
      .eq('pet_dim_id', pet.pet_dim_id)
      .eq('status', 'Approved')
      .maybeSingle();

    if (adoption) {
      return res.status(400).json({ 
        error: 'Cannot delete adopted pet. Pet has been adopted.' 
      });
    }

    await supabase
      .from('fact_adoptions')
      .delete()
      .eq('pet_dim_id', pet.pet_dim_id);

    const { error: deleteError } = await supabase
      .from('dim_pet')
      .delete()
      .eq('pet_id', id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: error.message });
  }
};

// Track QR scan
exports.trackQRScan = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: pet, error: petError } = await supabase
      .from('dim_pet')
      .select('pet_dim_id')
      .eq('pet_id', id)
      .single();

    if (petError) throw petError;

    const { data: adoption, error: adoptionError } = await supabase
      .from('fact_adoptions')
      .select('fact_id, qr_scan_count')
      .eq('pet_dim_id', pet.pet_dim_id)
      .eq('status', 'Approved')
      .maybeSingle();

    if (adoption) {
      const { data, error } = await supabase
        .from('fact_adoptions')
        .update({ 
          qr_scan_count: (adoption.qr_scan_count || 0) + 1 
        })
        .eq('fact_id', adoption.fact_id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ 
        success: true, 
        message: 'QR scan tracked',
        scan_count: data.qr_scan_count 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'QR scan tracked for available pet',
      scan_count: 0
    });
  } catch (error) {
    console.error('Error tracking QR scan:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update pet status
exports.updatePetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating pet ${id} status to ${status}`);

    if (!['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status: ${status}. Must be 'Available', 'Pending', or 'Adopted'` 
      });
    }

    const { data: pet, error: petError } = await supabase
      .from('dim_pet')
      .select('pet_dim_id')
      .eq('pet_id', id)
      .single();

    if (petError) throw petError;

    const { data: adoptions, error: adoptionError } = await supabase
      .from('fact_adoptions')
      .select('fact_id, status')
      .eq('pet_dim_id', pet.pet_dim_id)
      .order('fact_id', { ascending: false });

    if (adoptionError) throw adoptionError;

    if (status === 'Available') {
      if (adoptions && adoptions.length > 0) {
        const { error: deleteError } = await supabase
          .from('fact_adoptions')
          .delete()
          .eq('pet_dim_id', pet.pet_dim_id)
          .in('status', ['Pending', 'Rejected']);

        if (deleteError) throw deleteError;

        const hasApproved = adoptions.some(a => a.status === 'Approved');
        if (hasApproved) {
          return res.status(400).json({ 
            error: 'Cannot make pet available - it has an approved adoption.' 
          });
        }
      }

      return res.json({
        success: true,
        message: 'Pet status updated to Available',
        status: 'Available'
      });
    }

    if (status === 'Adopted') {
      const pendingAdoption = adoptions?.find(a => a.status === 'Pending');
      
      if (pendingAdoption) {
        const { data, error } = await supabase
          .from('fact_adoptions')
          .update({ 
            status: 'Approved',
            reviewed_at: new Date().toISOString()
          })
          .eq('fact_id', pendingAdoption.fact_id)
          .select()
          .single();

        if (error) throw error;

        return res.json({
          success: true,
          message: 'Pet marked as Adopted',
          status: 'Adopted'
        });
      } else {
        return res.status(400).json({ 
          error: 'Cannot mark as Adopted - no pending application exists.' 
        });
      }
    }

    if (status === 'Pending') {
      return res.status(400).json({ 
        error: 'Cannot manually set status to Pending.' 
      });
    }

  } catch (error) {
    console.error('Error updating pet status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear applications
exports.clearPetApplications = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: pet, error: petError } = await supabase
      .from('dim_pet')
      .select('pet_dim_id')
      .eq('pet_id', id)
      .single();

    if (petError) throw petError;

    const { error: deleteError } = await supabase
      .from('fact_adoptions')
      .delete()
      .eq('pet_dim_id', pet.pet_dim_id)
      .in('status', ['Pending', 'Rejected']);

    if (deleteError) throw deleteError;

    const { data: remaining } = await supabase
      .from('fact_adoptions')
      .select('fact_id')
      .eq('pet_dim_id', pet.pet_dim_id)
      .eq('status', 'Approved')
      .maybeSingle();

    const finalStatus = remaining ? 'Adopted' : 'Available';

    res.json({
      success: true,
      message: 'Pet applications cleared',
      status: finalStatus
    });
  } catch (error) {
    console.error('Error clearing applications:', error);
    res.status(500).json({ error: error.message });
  }
};